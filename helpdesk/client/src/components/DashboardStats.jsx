import React from "react";
import { FaTicketAlt, FaUsers, FaTags } from "react-icons/fa";
import { MdAssignmentInd } from "react-icons/md";

const DashboardStats = ({ role }) => {
  const commonStats = [
    {
      title: "Total Tickets",
      value: 123,
      icon: <FaTicketAlt className="text-blue-400" />,
    },
  ];

  const roleStats = {
    user: [],
    agent: [
      {
        title: "Assigned Tickets",
        value: 18,
        icon: <MdAssignmentInd className="text-purple-400" />,
      },
    ],
    admin: [
      {
        title: "Users",
        value: 42,
        icon: <FaUsers className="text-green-400" />,
      },
      {
        title: "Categories",
        value: 7,
        icon: <FaTags className="text-yellow-400" />,
      },
    ],
  };

  const statsToShow = [...commonStats, ...(roleStats[role] || [])];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {statsToShow.map((stat, index) => (
        <div
          key={index}
          className="bg-[#1c1c1e] p-4 rounded-lg shadow flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-400">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
          <div className="text-3xl">{stat.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
