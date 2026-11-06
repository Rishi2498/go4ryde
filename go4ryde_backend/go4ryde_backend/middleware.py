import jwt
from urllib.parse import parse_qs

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections

from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken

# ✅ SimpleJWT tools
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.backends import TokenBackend

User = get_user_model()


# ---------------- USER FETCH ---------------- #

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


# ---------------- TOKEN VALIDATION ---------------- #

def decode_token(token):
    """
    Decode JWT using SimpleJWT backend (correct way)
    """
    try:
        # ✅ Validate token
        UntypedToken(token)

        # ✅ Decode using SimpleJWT backend
        decoded = TokenBackend(
            algorithm=settings.SIMPLE_JWT["ALGORITHM"],
            signing_key=settings.SECRET_KEY
        ).decode(token, verify=True)

        return decoded

    except (InvalidToken, TokenError):
        return None
    except Exception:
        return None


# ---------------- MIDDLEWARE ---------------- #

# class JWTAuthMiddleware:

#     def __init__(self, inner):
#         self.inner = inner

#     def __call__(self, scope):
#         return JWTAuthMiddlewareInstance(scope, self.inner)
class JWTAuthMiddleware:

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):

        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)

        token = query_params.get("token")

        if token:
            try:
                access_token = AccessToken(token[0])
                user = await self.get_user(access_token["user_id"])
                scope["user"] = user
                print("✅ USER AUTH:", user)
            except Exception as e:
                print("❌ JWT ERROR:", e)
                scope["user"] = AnonymousUser()
        else:
            print("❌ NO TOKEN")
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()

class JWTAuthMiddlewareInstance:

    def __init__(self, scope, inner):
        self.scope = scope
        self.inner = inner

    async def __call__(self, receive, send):
        close_old_connections()

        try:
            # 🔥 1. Try QUERY PARAM (?token=...)
            query_string = self.scope.get("query_string", b"").decode()
            query_params = parse_qs(query_string)
            token = None

            if "token" in query_params:
                token = query_params["token"][0]

            # 🔥 2. Try HEADERS (Authorization: Bearer xxx)
            if not token:
                headers = dict(self.scope.get("headers", []))
                auth_header = headers.get(b"authorization")

                if auth_header:
                    auth_header = auth_header.decode()
                    if auth_header.startswith("Bearer "):
                        token = auth_header.split(" ")[1]

            # 🔥 3. Decode + fetch user
            if token:
                decoded = decode_token(token)

                if decoded:
                    user = await get_user(decoded.get("user_id"))
                    self.scope["user"] = user if user else AnonymousUser()
                else:
                    self.scope["user"] = AnonymousUser()
            else:
                self.scope["user"] = AnonymousUser()

        except Exception as e:
            print("❌ JWT Middleware Error:", str(e))
            self.scope["user"] = AnonymousUser()

        return await self.inner(self.scope, receive, send)