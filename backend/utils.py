from models.models import Listing

def published_listings(query):
    return query.filter(Listing.status == 'published')
