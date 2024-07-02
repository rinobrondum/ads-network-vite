/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react"

const Message = ({ msg, user1 }) => {
  const scrollRef = useRef()

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [msg])

  return (
    <div className={`mb-1 p-1 ${msg.sender === user1 ? "text-end" : ""}`} ref={scrollRef}>
      <p
        className={`p-2 ${msg.sender === user1 ? "bg-secondary text-white" : "gray"}`}
        style={{
          maxWidth: "50%",
          display: "inline-block",
          borderRadius: "5px",
        }}
      >
        {msg.text}
        <br />
        <small>
         {msg.createdAt.toDate().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          weekday: "long",
          // year: "numeric",
          // // month: "long",
          // day: "numeric",
          hour: "numeric",
          minute: "numeric",
          // timezone: "utc",
         })}
        </small>
      </p>
    </div>
  )
}

export default Message
