from pymongo import ASCENDING

def create_indexes(db):
    # unique index on faculty_profiles.user_id
    db["faculty_profiles"].create_index([("user_id", ASCENDING)], unique=True)
    db["notices"].create_index([("category", ASCENDING)])
    # Indexing array field for $in queries: works fine without special config
    db["notices"].create_index([("target_years", ASCENDING)])
    db["faculty_slots"].create_index([("faculty_id", ASCENDING)])
    db["faculty_slots"].create_index([("start_time", ASCENDING)])
    db["faculty_slots"].create_index([("created_at", DESCENDING)])