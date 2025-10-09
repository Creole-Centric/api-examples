from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import tts, webhooks
from services.creolecentric import CreoleCentricClient

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="CreoleCentric TTS API",
    description="CreoleCentric Text-to-Speech API - FastAPI Example",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Include TTS router
api_router.include_router(tts.router)
# Include Webhook router (RECOMMENDED)
api_router.include_router(webhooks.router)

# Add credit balance endpoint
client = CreoleCentricClient()

@api_router.get("/credits/balance")
async def get_credit_balance():
    """Get credit balance"""
    return await client.get_credit_balance()

# Include API router
app.include_router(api_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CreoleCentric TTS API - FastAPI Example",
        "version": "1.0.0",
        "endpoints": {
            "createJob": "POST /api/tts/jobs",
            "getJobStatus": "GET /api/tts/jobs/{job_id}",
            "getVoices": "GET /api/tts/voices",
            "getModels": "GET /api/tts/models",
            "getCreditBalance": "GET /api/credits/balance",
            "webhookReceiver": "POST /api/webhooks/tts (RECOMMENDED)",
            "webhookTest": "GET /api/webhooks/test"
        },
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "api_docs": "https://creolecentric.com/developer"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
