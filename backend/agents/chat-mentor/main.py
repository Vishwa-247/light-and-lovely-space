from fastapi import FastAPI
app = FastAPI(title="Chat Mentor Agent")

@app.get("/health")
async def health():
    return {"status": "healthy", "agent": "chat-mentor"}

@app.post("/message")
async def chat_message(data: dict):
    return {"response": "Hello from Chat Mentor Agent", "conversation_id": "demo"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)