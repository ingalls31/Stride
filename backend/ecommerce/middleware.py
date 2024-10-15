
from uu import Error
from user.models import Customer, User
from rest_framework_simplejwt.tokens import AccessToken

class CustomerMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        
        try: 
            token = request.headers.get('authorization')[7:]
            obj = AccessToken(token)
            user_id = obj.payload['user_id']
            customer = Customer.objects.get(user__id=user_id)
            request.customer = customer
        except:
            try:
                customer = Customer.objects.get(user=request.user)
                request.customer = customer
            except:
                pass

        response = self.get_response(request)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"

        return response