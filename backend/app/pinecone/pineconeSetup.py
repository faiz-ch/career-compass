from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import os


def connect_pinecone(index_name: str):
    # Load environment variables from .env
    load_dotenv()
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

    if not PINECONE_API_KEY:
        raise ValueError("PINECONE_API_KEY not found in environment variables.")

    # Initialize the Pinecone client
    pc = Pinecone(api_key=PINECONE_API_KEY)

    # Create the index if it doesn't already exist
    existing_indexes = [index["name"] for index in pc.list_indexes()]
    if index_name not in existing_indexes:
        pc.create_index(
            name=index_name,
            dimension=384,
            metric="dotproduct",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )

    # Return the index object
    return pc.Index(index_name)
