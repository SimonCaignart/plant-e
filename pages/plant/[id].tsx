/* eslint-disable @next/next/no-img-element */
import { Plant, PlantLog } from "@prisma/client";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import Router from "next/router";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import Layout from "../../components/Layout";
import { ModalTreshold } from "../../components/modalTreshold";
import { SignIn } from "../../components/SignIn";
import { fromDate } from "../../functions/localTimeString";
import prisma from "../../lib/prisma";
import { PlantUpdateInput } from "../../types/PlantUpdateInput";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const plant = await prisma.plant.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      logs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 480,
      },
    },
  });

  return {
    props: JSON.parse(JSON.stringify(plant)),
  };
};

const Plant: React.FC<
  Plant & {
    logs: PlantLog[];
  }
> = (props) => {
  const { data: session } = useSession();

  const [showModal, setShowModal] = useState(false);
  async function deletePlant(id: string): Promise<void> {
    await fetch(`/api/plant/${id}`, {
      method: "DELETE",
    });
    Router.push("/");
  }

  async function updateAutomaticWatering(id: string): Promise<void> {
    const plantUpdateInput: PlantUpdateInput = {
      automaticWatering: !props.automaticWatering,
    };

    await fetch(`/api/plant/${id}`, {
      method: "PUT",
      body: JSON.stringify(plantUpdateInput),
    });
    Router.push(`/plant/${id}`);
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
  };

  // const labels = ["January", "February", "March", "April", "May", "June", "July"];

  const luminosityData = {
    datasets: [
      {
        fill: true,
        label: "Luminosité",
        data: props.logs.map((log) => {
          return log.luminosity;
        }),
        borderColor: "rgba(255, 222, 105, 0.5)",
        backgroundColor: "rgba(254, 242, 205, 0.6)",
      },
    ],
  };

  const soilMoistureData = {
    // labels,
    datasets: [
      {
        fill: true,
        label: "Humidité du sol",
        data: props.logs.map((log) => {
          return log.soilMoisture;
        }),
        borderColor: "rgba(255, 148, 62, 0.3)",
        backgroundColor: "rgba(92, 159, 27, 0.4)",
      },
    ],
  };

  const humidityData = {
    datasets: [
      {
        fill: true,
        label: "Humidité",
        data: props.logs.map((log) => {
          return log.humidity;
        }),
        borderColor: "rgba(0, 168, 243, 0.3)",
        backgroundColor: "rgba(127, 237, 254, 0.3)",
      },
    ],
  };

  const temperatureData = {
    datasets: [
      {
        fill: true,
        label: "Temperature",
        data: props.logs.map((log) => {
          return log.temperature;
        }),
        borderColor: "rgba(205, 32, 38, 0.3)",
        backgroundColor: "rgba(255, 43, 58, 0.3)",
      },
    ],
  };

  if (!session) {
    return <SignIn />;
  }

  return (
    <Layout>
      <div
        className="min-h-screen bg-cover px-5 pb-5 xl:px-10 xl:pb-10"
        style={{ backgroundImage: "url(/wave.svg)" }}
      >
        <h2 className="mb-10 pt-5 text-5xl text-white xl:mb-0">{props.name}</h2>

        <div className="grid justify-center xl:grid-cols-[30%_70%]">
          <section>
            <img
              className="order-1 mt-16 max-w-sm p-12 xl:order-none"
              src={props.image}
              alt={props.commonName}
            />
            {/* <h2 className="mb-4 mt-10 text-2xl text-white">
              🗒️ Notes
              <button
                onClick={() => {
                  setShowModal(true);
                }}
              >
                ✏️
              </button>
            </h2> */}
          </section>

          <section className="mt-5">
            <div className="flex flex-col gap-1">
              <h2 className="mb-4 text-2xl text-white">⚡ Actions Rapides</h2>

              <div className="flex items-center gap-4">
                <button
                  className="waterAPlant btn btn-accent flex w-56 items-center justify-center text-white shadow-lg"
                  onClick={() => waterAPlant(props.id)}
                >
                  <span>Arroser la plante</span>
                </button>
                <button
                  onClick={() => updateAutomaticWatering(props.id)}
                  className="btn btn-ghost bg-fuchsia-500 text-white shadow-lg hover:bg-fuchsia-600"
                >
                  Arrosage automatique :{" "}
                  {props.automaticWatering ? "Activé" : "Désactivé"}
                </button>
                <button
                  className="btn btn-error w-44 text-white shadow-lg hover:bg-red-600"
                  onClick={() => deletePlant(props.id)}
                >
                  Supprimer
                </button>
              </div>

              <h2 className="mb-4 mt-10 text-2xl text-white">
                📈 Statistiques{" "}
                <span className="ml-2 font-mono text-sm text-gray-100">
                  {props.logs && props.logs.length > 0
                    ? `Mis à jour ${fromDate(
                        new Date(props.logs.at(0).createdAt)
                      )}`
                    : ""}
                </span>
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-white px-4 py-6 text-xl shadow-xl">
                  <div className="collapse-arrow collapse">
                    <input type="checkbox" />
                    <div className="collapse-title">
                      💦 Humidité dans l'air :{" "}
                      {props.logs && props.logs.length > 0
                        ? `${props.logs.at(0).humidity} %`
                        : "Aucune valeur"}{" "}
                    </div>
                    <div className="collapse-content">
                      <Line options={options} data={humidityData} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white px-4 py-6 text-xl shadow-xl">
                  <div className="collapse-arrow collapse">
                    <input type="checkbox" />
                    <div className="collapse-title">
                      🪴 Humidité dans le sol :{" "}
                      {props.logs && props.logs.length > 0
                        ? `${props.logs.at(0).soilMoisture} %`
                        : "Aucune valeur"}
                    </div>
                    <div className="collapse-content">
                      <Line options={options} data={soilMoistureData} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white px-4 py-6 text-xl shadow-xl">
                  <div className="collapse-arrow collapse">
                    <input type="checkbox" />
                    <div className="collapse-title">
                      💡 Luminosité:{" "}
                      {props.logs && props.logs.length > 0
                        ? `${props.logs.at(0).luminosity} %`
                        : "Aucune valeur"}
                    </div>
                    <div className="collapse-content">
                      <Line options={options} data={luminosityData} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white px-4 py-6 text-xl shadow-xl">
                  <div className="collapse-arrow collapse">
                    <input type="checkbox" />
                    <div className="collapse-title">
                      🌡️ Température:{" "}
                      <span className="text-gray-600">
                        {props.logs && props.logs.length > 0
                          ? `${props.logs.at(0).temperature} °C`
                          : "Aucune valeur"}
                      </span>
                    </div>
                    <div className="collapse-content">
                      <Line options={options} data={temperatureData} />
                    </div>
                  </div>
                </div>
              </div>
              <h2 className="mb-4 mt-10 text-2xl text-white">
                🤖 Arrosage automatique{" "}
                <button
                  onClick={() => {
                    setShowModal(true);
                  }}
                >
                  ✏️
                </button>
              </h2>
              <div className="rounded-xl bg-white p-4 shadow-xl">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  <div>
                    <span className="font-bold">Fréquence d'arrosage :</span>
                    <p>
                      {props.wateringFrequency == null
                        ? "Aucune Valeur"
                        : `Tous les ${props.wateringFrequency} jours`}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold">
                      Quantité d'eau par arrosage :
                    </span>
                    <p>
                      {props.waterQuantity == null
                        ? "Aucune Valeur"
                        : `${props.waterQuantity} ml`}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold">
                      Seuil d'humidité de la terre :
                    </span>
                    <p>
                      {props.soilMoistureThreshold == 0
                        ? "Aucune Valeur"
                        : `${props.soilMoistureThreshold} %`}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold">
                      Seuil d'humidité extérieure :
                    </span>
                    <p>
                      {props.humidityThreshold == 0
                        ? "Aucune Valeur"
                        : `${props.humidityThreshold} %`}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold">
                      Seuil de température extérieure :
                    </span>
                    <p>
                      {props.temperatureThreshold == 0
                        ? "Aucune Valeur"
                        : `${props.temperatureThreshold} °C`}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold">Seuil de luminosité :</span>
                    <p>
                      {props.luminosityThreshold == 0
                        ? "Aucune Valeur"
                        : `${props.luminosityThreshold} %`}
                    </p>
                  </div>
                </div>
              </div>
              <h2 className="mb-4 mt-10 text-2xl text-white">
                ℹ️ Informations sur votre plante
              </h2>

              <div className="rounded-xl bg-white p-4 shadow-xl">
                <p>
                  <span className="font-bold">Nom commun :</span>{" "}
                  {props.commonName}
                </p>
                <p>
                  <span className="font-bold">Nom latin :</span>{" "}
                  {props.latinName}
                </p>
                <p>
                  <span className="font-bold">Description :</span>{" "}
                  {props.description}
                </p>
              </div>
            </div>
          </section>
        </div>
        {showModal && (
          <ModalTreshold plant={props} setShowModal={setShowModal} />
        )}
      </div>
    </Layout>
  );
};

export default Plant;

async function waterAPlant(id: string) {
  try {
    await fetch("/api/waterPlant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id),
    });
  } catch (error) {
    console.error(error);
  }
}
