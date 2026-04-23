import jwt
from urllib.parse import parse_qs

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections

from channels.db import database_sync_to_async

# ✅ For SimpleJWT validation
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()


# ---------------- USER FETCH ---------------- #
   
@database_sync_to_async
def get_user_from_token(token):
    try:
        # ✅ Validate token (important for SimpleJWT)
        UntypedToken(token)

        # ✅ Decode token
        decoded_data = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = decoded_data.get("user_id")

        user = User.objects.get(id=user_id)
        return user

    except InvalidToken:
        print("❌ Invalid JWT token")
    except TokenError:
        print("❌ Token error")
    except jwt.ExpiredSignatureError:
        print("❌ Token expired")
    except User.DoesNotExist:
        print("❌ User not found")
    except Exception as e:
        print("❌ Unknown JWT error:", e)

    return AnonymousUser()


# ---------------- MIDDLEWARE ---------------- #

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        close_old_connections()

        try:
            query_string = scope.get("query_string", b"").decode()
            query_params = parse_qs(query_string)

            token_list = query_params.get("token", [])

            if token_list:
                token = token_list[0]

                print("🔑 WS TOKEN RECEIVED")

                user = await get_user_from_token(token)

                if user and not user.is_anonymous:
                    print("✅ WS AUTH USER:", user)
                else:
                    print("❌ WS AUTH FAILED → Anonymous")

                scope["user"] = user

            else:
                print("⚠️ No token provided in WS")
                scope["user"] = AnonymousUser()

        except Exception as e:
            print("❌ Middleware crash:", e)
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)