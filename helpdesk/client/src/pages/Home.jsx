import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  // Redirect authenticated users to their respective dashboards
  if (isAuthenticated()) {
    const route =
      user?.role?.toLowerCase() === "admin"
        ? "/admin"
        : user?.role?.toLowerCase() === "agent"
        ? "/agent"
        : "/dashboard";
    return <Navigate to={route} replace />;
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] overflow-x-hidden">
      <div className="px-10 md:px-40 flex flex-1 justify-center py-5">
        <div className="flex flex-col max-w-[960px] flex-1">
          <div className="@container">
            <div className="@[480px]:p-4">
              <div
                className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-start justify-end px-4 pb-10 @[480px]:px-10"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%), url("https://cdn.usegalileo.ai/sdxl10/cd834abb-af4f-4ff6-b06c-77f1e72c7678.png")',
                }}
              >
                <div className="flex flex-col gap-2 text-left">
                  <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                    The modern helpdesk for the digital age
                  </h1>
                  <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                    HelpDesk is designed to support your customers on any channel,
                    and scale with you as you grow.
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/login"
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition @[480px]:h-12 @[480px]:px-5"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-800 rounded text-white transition @[480px]:h-12 @[480px]:px-5"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Features section */}
          <div className="flex flex-col gap-10 px-4 py-10 @container">
            <div className="flex flex-col gap-4">
              <h1 className="text-gray-100 tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                HelpDesk for every role
              </h1>
              <p className="text-gray-300 text-base font-normal leading-normal max-w-[720px]">
                Support your customers and employees with a help desk that's built
                for your needs. Whether you're providing customer service, IT
                support, or managing shared inboxes, HelpDesk has you covered.
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
              {[
                {
                  title: "Customer support",
                  desc: "Deliver great customer service with a simple help desk that scales with your business.",
                  img: "https://cdn.usegalileo.ai/sdxl10/e1352ddf-e879-40a4-89ba-c677e2f70a16.png",
                },
                {
                  title: "IT service desk",
                  desc: "Deliver IT support at scale with a service desk that helps you prioritize, manage, and respond to requests.",
                  img: "https://cdn.usegalileo.ai/sdxl10/1f2b40a5-5992-4963-859b-d3c98bd3b302.png",
                },
                {
                  title: "Shared inbox for teams",
                  desc: "Collaborate on email, social media, chat, and more in one shared inbox.",
                  img: "https://cdn.usegalileo.ai/sdxl10/9b74b53d-578b-4c70-a456-f3b2b1975f17.png",
                },
              ].map(({ title, desc, img }, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-xl bg-[#222222] p-4 shadow-md hover:bg-[#333333] transition cursor-pointer"
                >
                  <img
                    className="mb-4 max-h-[78px] object-contain"
                    src={img}
                    alt={title}
                  />
                  <h3 className="text-white font-semibold text-lg">{title}</h3>
                  <p className="text-gray-300 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs section */}
          <div className="px-4 pb-10">
            <h2 className="mb-6 text-gray-100 text-lg font-bold">FAQs</h2>
            <div className="divide-y divide-gray-700 border-t border-gray-700">
              {[
                {
                  question: "What is HelpDesk.io?",
                  answer:
                    "HelpDesk.io is a modern customer support platform designed to streamline communication between businesses and their customers.",
                },
                {
                  question: "How do I sign up?",
                  answer:
                    "Click on the 'Sign up' button to create a new account and start using HelpDesk.io right away.",
                },
                {
                  question: "Is there a free trial?",
                  answer:
                    "Yes, HelpDesk.io offers a 14-day free trial with access to all features.",
                },
              ].map(({ question, answer }, i) => (
                <details
                  key={i}
                  className="group py-4 cursor-pointer text-white"
                  open={i === 0}
                >
                  <summary className="font-semibold">{question}</summary>
                  <p className="mt-2 text-gray-300">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
