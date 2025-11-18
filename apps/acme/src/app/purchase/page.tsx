"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trackPurchase } from "@/lib/refref-events";

interface User {
  id: string;
  email: string;
  name: string;
}

const PRODUCTS = [
  { id: "basic", name: "Basic Plan", price: 9.99 },
  { id: "pro", name: "Pro Plan", price: 29.99 },
  { id: "enterprise", name: "Enterprise Plan", price: 99.99 },
];

export default function PurchasePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    fetch("/api/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handlePurchase = async (productId: string) => {
    if (!user) return;

    setPurchasing(true);
    setSelectedProduct(productId);

    try {
      const product = PRODUCTS.find((p) => p.id === productId);
      if (!product) {
        alert("Product not found");
        setPurchasing(false);
        return;
      }

      // Simulate purchase delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Track purchase event with RefRef
      await trackPurchase(user.email, product.price, product.name);

      // Show success message
      alert(`Successfully purchased ${product.name}!`);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
      setSelectedProduct(null);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "800px", margin: "100px auto", padding: "20px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "100px auto", padding: "20px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1>Choose Your Plan</h1>
        <p>Select a plan to get started with ACME</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {PRODUCTS.map((product) => (
          <div
            key={product.id}
            data-testid={`product-${product.id}`}
            style={{
              padding: "30px",
              background: "#f5f5f5",
              borderRadius: "8px",
              border: "2px solid #ddd",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>{product.name}</h2>
            <p
              style={{ fontSize: "32px", fontWeight: "bold", margin: "20px 0" }}
            >
              ${product.price}
              <span style={{ fontSize: "16px", fontWeight: "normal" }}>
                /mo
              </span>
            </p>
            <button
              onClick={() => handlePurchase(product.id)}
              disabled={purchasing && selectedProduct === product.id}
              data-testid={`purchase-${product.id}`}
              style={{
                width: "100%",
                padding: "12px",
                background:
                  purchasing && selectedProduct === product.id
                    ? "#ccc"
                    : "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                cursor:
                  purchasing && selectedProduct === product.id
                    ? "not-allowed"
                    : "pointer",
                marginTop: "20px",
              }}
            >
              {purchasing && selectedProduct === product.id
                ? "Processing..."
                : "Purchase"}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <a
          href="/dashboard"
          style={{ color: "#0070f3", textDecoration: "none" }}
          data-testid="back-to-dashboard"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
