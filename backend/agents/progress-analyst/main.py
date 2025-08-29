from fastapi import FastAPI
app = FastAPI(title="Progress Analyst Agent")

@app.get("/health")
async def health():
    return {"status": "healthy", "agent": "progress-analyst"}

@app.get("/progress")
async def get_progress(user_id: str):
    return {"data": [], "success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)