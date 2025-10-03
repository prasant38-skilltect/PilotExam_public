
"use client";
import { useEffect } from "react";

const PaymentPage = (props: any) => {
  useEffect(() => {
    const { user, price, plan, paymentProcessLoading } = props;
    if (paymentProcessLoading) {
      const loadScript = (src: string) => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const startPayment = async () => {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
          alert("Razorpay SDK failed to load");
          return;
        }

        const orderRes = await fetch("/api/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: price }),
        });

        const order = await orderRes.json();

        const options = {
          // key: process.env.RAZORPAY_KEY_ID, // please un-comment line and add key value from env file
          amount: order.amount,
          currency: order.currency,
          name: "Quiz Subscription",
          description: `${plan} subscription`,
          order_id: order.id,
          handler: function (response: any) {
            // alert("Payment successful! Payment ID: " + response.razorpay_payment_id); // You can handle post-payment logic here
            props.handlePaymentResponse(response);
          },
          modal: {
            ondismiss: function () {
              props.handlePaymentResponse({});
            },
          },
          prefill: {
            name: `${user.firstName} ${user.lastName}`,
            email: `${user.email}`,
            contact: `${user.phone || ''}`,
          },
          theme: {
            color: "#3399cc",
          },
        };

        //@ts-ignore
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      };

      if (price) startPayment();
    }
  }, [props.paymentProcessLoading]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="text-lg font-semibold mb-4">Processing Payment...</p>
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mx-auto"></div>
      </div>
    </div>
  );
}

export default PaymentPage;
