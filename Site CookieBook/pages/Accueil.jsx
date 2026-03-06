import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../data/catalog.js";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

export default function Home() {
  const nav = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const hero = useMemo(() => {
    const any = CATEGORIES[0];
    return {
      title: "Des douceurs qui claquent ✨",
      subtitle:
        "Commande tes cookies, crêpes, churros et tiramisus. Personnalise, ajoute au panier, puis paie en 2 minutes.",
      image: any.image,
    };
  }, []);

  return (
    <div className="stack gap-xl">
      {/* Image représentative */}

      <section className="hero card">
        <div className="hero-text">
          <h1>{hero.title}</h1>
          <p className="muted">{hero.subtitle}</p>

          {/* Bouton Commander -> page qui propose livrer / emporter */}
          <div className="row gap">
            <button className="btn primary" onClick={() => setShowModal(true)}>
              Commander
            </button>
            <button className="btn" onClick={() => nav("/menu")}>
              Voir le menu
            </button>
          </div>
        </div>

        <div className="hero-img" role="img" aria-label="Photo de pâtisseries">
          <img src={hero.image} alt="Pâtisseries" />
        </div>
      </section>

      {/* Section horaires et délai de fabrication */}
      <section className="card">
        <h2>Horaires & délais de fabrication</h2>
        <div className="grid-2">
          <div className="info">
            <div className="info-title">Horaires</div>
            <div className="muted">Lun–Sam • 10h à 18h</div>
            <div className="muted">Dimanche • sur demande</div>
          </div>
          <div className="info">
            <div className="info-title">Délais</div>
            <div className="muted">24–48h en général</div>
            <div className="muted">
              Les grosses commandes peuvent demander plus (tu verras ça au panier).
            </div>
          </div>
        </div>
      </section>

      {/* Aperçu des variétés */}
        <section className="card">
                <h2>Nos catégories</h2>

                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={3}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000 }}
                    breakpoints={{
                    320: { slidesPerView: 1 },
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    }}
                >
                    {CATEGORIES.map((c) => (
                    <SwiperSlide key={c.id}>
                        <div className="category-card" onClick={() => nav(`/menu/${c.id}`)}>
                        <img src={c.image} alt={c.name} />
                        <h3>{c.heroEmoji} {c.name}</h3>
                        <p className="muted">{c.description}</p>
                        </div>
                    </SwiperSlide>
                    ))}
                </Swiper>
        </section>


      {/* Modal livraison / emporter */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3>Tu préfères quoi ?</h3>
            <p className="muted">Tu peux choisir maintenant, tu pourras modifier au paiement.</p>

            <div className="row gap">
              <button
                className="btn primary"
                onClick={() => {
                  setShowModal(false);
                  nav("/menu");
                }}
              >
                Continuer (choisir mes produits)
              </button>
              <button className="btn" onClick={() => setShowModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

