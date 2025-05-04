from fastapi import FastAPI

app = FastAPI(title="DoctaJus IA")

@app.get("/")
async def root():
    return {"message": "API de IA para DoctaJus"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

