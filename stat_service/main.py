from fastapi import FastAPI

app = FastAPI(
    title="Running coach API test",
    version="1.0.0"
)

@app.get("/health")
def health_check() :
    return {
        "status" : "UP",
        "service" : "ruuning stat api",
        "version" : "1.0.0"
    }