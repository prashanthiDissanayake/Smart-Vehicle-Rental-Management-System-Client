import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Vehicles Data
  const vehicles = [
    {
        "_id": "69be0860b6fc0449ea2e1d55",
        "image": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80",
        "licensePlate": "CBG7653",
        "make": "BMW",
        "model": "i8",
        "pricePerDay": 1000,
        "status": "Available",
        "type": "Sports",
        "year": 2018
    },
    {
        "_id": "69bfe8c0cdb3ec03d0cd19c8",
        "image": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80",
        "licensePlate": "CGR9854",
        "make": "Benz",
        "model": "C200",
        "pricePerDay": 5000,
        "status": "Available",
        "type": "Sedan",
        "year": 2026
    }
  ];

  // In-memory storage for bookings and payments
  const bookings: any[] = [];
  const payments: any[] = [];

  // API Routes
  app.get("/api/vehicles", (req, res) => {
    res.json(vehicles);
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    
    // Simple mock login
    if (email && password) {
      res.json({
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjlkNWZlZWQzYWNhMmJlMmYwMzVkMWYxIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiZXhwIjoxNzc1OTg0ODU4fQ.SfX438QESgskzzDviByrSvQPdPYqtBZ3zEgs0NOJLmo",
        "user": {
            "email": email,
            "id": "69d5feed3aca2be2f035d1f1",
            "name": email.split('@')[0],
            "role": "Admin"
        }
      });
    } else {
      res.status(400).json({ message: "Email and password are required" });
    }
  });

  app.put("/api/profile", (req, res) => {
    const { name, email } = req.body;
    // In a real app, we would verify the token and update the database
    // For now, we just return the updated user info
    res.json({
      id: "69d5feed3aca2be2f035d1f1",
      name: name,
      email: email,
      role: "Admin"
    });
  });

  app.get("/api/bookings", (req, res) => {
    // Return all bookings for now (in a real app, filter by user ID from token)
    res.json(bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const bookingData = req.body;
    bookings.push(bookingData);
    console.log("Booking Saved:", bookingData);
    res.status(201).json({ message: "Booking created successfully", booking: bookingData });
  });

  app.get("/api/payments", (req, res) => {
    res.json(payments);
  });

  app.post("/api/payments", (req, res) => {
    const paymentData = req.body;
    payments.push(paymentData);
    console.log("Payment Received:", paymentData);
    res.status(201).json({ message: "Payment processed successfully", payment: paymentData });
  });

  app.put("/api/payments/:id", (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const index = payments.findIndex(p => p.id === id);
    
    if (index !== -1) {
      payments[index] = { ...payments[index], ...updateData };
      console.log("Payment Updated:", payments[index]);
      res.json({ message: "Payment updated successfully", payment: payments[index] });
    } else {
      res.status(404).json({ message: "Payment not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
