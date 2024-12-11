
class ProductInfo:    
    def __init__(self, name, description, average_rating, category):
        self.name = name
        self.description = description
        self.average_rating = average_rating
        self.category = category

    def __str__(self):
        return self.name

class Price:
    def __init__(self, cost, price, old_price):
        self.cost = cost
        self.price = price
        self.old_price = old_price

    def __str__(self):
        return f"{self.cost}, {self.price}, {self.old_price}"

class PaymentOrder:
    def __init__(self, payment_session, payment_done):
        self.payment_session = payment_session
        self.payment_done = payment_done

    def __str__(self):
        return f"{self.payment_session}, {self.payment_done}"

class ShippingAddress:
    def __init__(self, receiver, phone, address):
        self.receiver = receiver
        self.phone = phone
        self.address = address

    def __str__(self):
        return f"{self.receiver}, {self.phone}, {self.address}"

class ReviewInfo:
    def __init__(self, comment, reply, rate_point):
        self.comment = comment
        self.reply = reply
        self.rate_point = rate_point

    def __str__(self):
        return f"{self.comment}, {self.reply}, {self.rate_point}"

