from rest_framework.throttling import UserRateThrottle


class CreatePaymentThrottle(UserRateThrottle):
    scope = "create_payment"


class VerifyPaymentThrottle(UserRateThrottle):
    scope = "verify_payment"


class BookingThrottle(UserRateThrottle):
    scope = "booking"

class WalletTransactionThrottle(UserRateThrottle):
    scope = "wallet_transaction"            

class BankAccountThrottle(UserRateThrottle):
    scope = "bank_account"  
        
class WithdrawalThrottle(UserRateThrottle):
    scope = "withdrawal"