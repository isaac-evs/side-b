# Side-B Backend

## Setup

1.  **Start MongoDB**:
    Run the following command from the root of the project:
    ```bash
    docker-compose up -d
    ```

2.  **Install Dependencies**:
    Navigate to the `backend` directory and install the requirements:
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

3.  **Run the Application**:
    Start the FastAPI server:
    ```bash
    uvicorn app.main:app --reload
    ```

## API Documentation

Once the server is running, you can access the interactive API documentation at:
http://127.0.0.1:8000/docs
