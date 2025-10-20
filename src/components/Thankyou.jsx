import Navbar from "./Navbar";

function Thankyou() {
  return (
    <div className="thankyou-container">
      <Navbar />
      <div className="ty">
        <h1>Thank You!</h1>
        <p>Your submission has been received.</p>
        <p>Feel free to close this tab.</p>
      </div>
    </div>
  );
}

export default Thankyou;
