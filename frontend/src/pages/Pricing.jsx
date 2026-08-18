import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";

const CARD_NUMBER = "4466 1369 5161 0915";
const CARD_OWNER = "Baxtiyorov Shaxriyor";
const TELEGRAM_CONTACT = "https://t.me/vio_waxa31";

const PLANS = [
  {
    id: "premium",
    name: "Premium",
    price: "20 000",
    color: "premium",
    features: ["Premium darajadagi barcha kinolar", "Reklamasiz tomosha", "Yuqori sifat"],
  },
  {
    id: "vip",
    name: "VIP",
    price: "15 000",
    color: "vip",
    features: ["Barcha kinolar (Premium + VIP)", "Eng birinchi yangi kinolar", "Maxsus VIP belgisi"],
  },
];

export default function Pricing() {
  const { user } = useAuth();

  return (
    <main className="pricing">
      <section className="hero">
        <p className="eyebrow">Tariflar</p>
        <h1>Premium yoki VIP tanlang</h1>
        <p className="hero-sub">
          To'lovni amalga oshirgach, chek skrinshotini Telegram orqali yuboring — tarifingiz qo'lda faollashtiriladi.
        </p>
      </section>

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <div className="pricing-card" key={plan.id}>
            <span className={`tier-chip tier-${plan.color}`}>{plan.name}</span>
            <div className="pricing-amount">
              {plan.price} <span>so'm / oy</span>
            </div>
            <ul className="pricing-features">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {user ? (
              <a href={TELEGRAM_CONTACT} target="_blank" rel="noopener noreferrer" className="btn-solid full">
                Sotib olish
              </a>
            ) : (
              <Link to="/login" className="btn-solid full">
                Avval kiring
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="pricing-instructions">
        <h2>To'lov qanday amalga oshiriladi?</h2>
        <ol>
          <li>Karta raqamiga tanlagan tarifingiz summasini o'tkazing:</li>
        </ol>
        <div className="card-details">
          <div>
            <span className="card-label">Karta raqami</span>
            <span className="card-value">{CARD_NUMBER}</span>
          </div>
          <div>
            <span className="card-label">Karta egasi</span>
            <span className="card-value">{CARD_OWNER}</span>
          </div>
        </div>
        <ol start="2">
          <li>
            To'lov chekining skrinshotini{" "}
            <a href={TELEGRAM_CONTACT} target="_blank" rel="noopener noreferrer">
              Telegram orqali yuboring
            </a>{" "}
            (ro'yxatdan o'tgan emailingizni ham yozing).
          </li>
          <li>Tarifingiz 1 soat ichida faollashtiriladi.</li>
        </ol>
      </div>
    </main>
  );
              }
