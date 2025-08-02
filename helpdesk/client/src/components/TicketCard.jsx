import React from "react";
import { formatDate } from "../utils/formatDate";

const TicketCard = ({ ticket, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-md p-4 cursor-pointer hover:bg-gray-700 transition"
    >
      <h4 className="text-lg font-semibold">{ticket.title}</h4>
      <p className="text-sm text-gray-400 truncate">{ticket.description}</p>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Category: {ticket.category}</span>
        <span>Status: {ticket.status}</span>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        Created on: {formatDate(ticket.createdAt)}
      </div>
    </div>
  );
};

export default TicketCard;
