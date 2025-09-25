import { useNavigate } from "react-router-dom";

const features = [
  { title: "Raise Questions", description: "Post categorized questions on technical topics." },
  { title: "Answer & Vote", description: "Provide solutions and vote on the best answers." },
  { title: "Follow Questions", description: "Follow questions and get notified on updates." },
  { title: "Admin Controls", description: "Manage users, FAQs, and inappropriate content." },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Moringa<span style={styles.highlight}>Desk</span>
        </h1>
        <p style={styles.subtitle}>
          A collaborative Q&A platform for students to solve problems faster,
          avoid duplication, and share knowledge.
        </p>

        {/* Buttons for Login and Register */}
        <div style={styles.buttonContainer}>
          <button
            style={styles.buttonPrimary}
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
          <button
            style={styles.buttonOutline}
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <h2 style={styles.featuresTitle}>Key Features</h2>
        <div style={styles.featureCards}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#111827", fontWeight: "600" }}>
                {feature.title}
              </h3>
              <p style={{ color: "#374151" }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} MoringaDesk — All Rights Reserved.
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    lineHeight: "1.6",
    margin: "0",
    padding: "0",
    boxSizing: "border-box",
    backgroundColor: "#f8fafc",
  },
  hero: {
    textAlign: "center",
    padding: "100px 20px",
    background: "linear-gradient(180deg, #f0fdf4, #e0f2fe)",
  },
  title: {
    fontSize: "3.5em",
    fontWeight: "bold",
    color: "#111827",
  },
  highlight: {
    color: "#22c55e",
  },
  subtitle: {
    fontSize: "1.3em",
    maxWidth: "800px",
    margin: "20px auto",
    fontWeight: "400",
    lineHeight: "1.6",
    color: "#374151",
  },
  buttonContainer: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  buttonPrimary: {
    backgroundColor: "#22c55e",
    color: "#ffffff",
    padding: "12px 30px",
    fontSize: "1em",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    color: "#111827",
    padding: "12px 30px",
    fontSize: "1em",
    border: "2px solid #111827",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  features: {
    padding: "60px 20px",
    textAlign: "center",
    backgroundColor: "#ffffff",
  },
  featuresTitle: {
    fontSize: "2.5em",
    marginBottom: "40px",
    color: "#111827",
    fontWeight: "bold",
  },
  featureCards: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "24px",
  },
  card: {
    backgroundColor: "#f9fafb",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    width: "260px",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    cursor: "pointer",
  },
  footer: {
    backgroundColor: "#ffffff",
    color: "#6b7280",
    textAlign: "center",
    padding: "20px",
    marginTop: "40px",
    fontSize: "0.9em",
    borderTop: "1px solid #e5e7eb",
  },
};
