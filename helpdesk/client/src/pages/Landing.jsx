import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const Landing = () => {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#0F0F0F] group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#1f2937] px-10 py-3">
          <div className="flex items-center gap-4 text-white">
            <div className="size-4">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <g clipPath="url(#clip0_6_319)">
                  <path
                    d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                    fill="currentColor"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_319">
                    <rect width="48" height="48" fill="white"></rect>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <Link to="/" className="text-white text-2xl font-bold tracking-wide">
                        <span className="text-indigo-500">HelpDesk</span>.io
                      </Link>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a
                className="text-gray-300 text-sm font-medium leading-normal hover:text-white transition"
                href="#"
              >
                How it works
              </a>
              <a
                className="text-gray-300 text-sm font-medium leading-normal hover:text-white transition"
                href="#"
              >
                Pricing
              </a>
              <a
                className="text-gray-300 text-sm font-medium leading-normal hover:text-white transition"
                href="#"
              >
                Resources
              </a>
              <a
                className="text-gray-300 text-sm font-medium leading-normal hover:text-white transition"
                href="#"
              >
                Enterprise
              </a>
            </div>
            <div className="flex gap-2">
              <Link
                to="/login"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-gray-700 hover:bg-gray-800 rounded text-white transition"
              >
                Sign up
              </Link>
            </div>
          </div>
        </header>

        <div className="px-10 md:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
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
                      HelpDesk is designed to support your customers on any channel, and scale with you as you grow. Our flexible plans are perfect for startups,
                      small businesses, and large enterprises alike.
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/register"
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition @[480px]:h-12 @[480px]:px-5"
                    >
                      Sign up
                    </Link>
                    <Link
                      to="/demo-request"
                      className="px-6 py-2 bg-gray-700 hover:bg-gray-800 rounded text-white transition @[480px]:h-12 @[480px]:px-5"
                    >
                      Request a demo
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-10 px-4 py-10 @container">
              <div className="flex flex-col gap-4">
                <h1 className="text-gray-100 tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                  HelpDesk for every role
                </h1>
                <p className="text-gray-300 text-base font-normal leading-normal max-w-[720px]">
                  Support your customers and employees with a help desk that’s built for your needs. Whether you’re providing customer service, IT support, or managing
                  shared inboxes, HelpDesk has you covered.
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
      <Footer/>
    </div>
  );
};

export default Landing;
