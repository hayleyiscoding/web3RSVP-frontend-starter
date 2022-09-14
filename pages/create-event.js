import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import getRandomImage from "../utils/getRandomImage";
import { ethers } from "ethers";
import connectContract from "../utils/connectContract";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Alert from "../components/Alert";
import { Web3Storage } from "web3.storage";
import { useRouter } from "next/router";

function makeStorageClient() {
  return new Web3Storage({
    token: process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN,
  });
}

export default function CreateEvent() {
  const { data: account } = useAccount();
  const [success, setSuccess] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(null);
  const [eventID, setEventID] = useState(null);

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventCost, setEventCost] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [refund, setRefund] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [image, setImage] = useState(null);

  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();

    const body = {
      name: eventName,
      description: eventDescription,
      link: eventLink,
      image: "/" + image.name,
    };

    try {
      const buffer = Buffer.from(JSON.stringify(body));
      const files = [new File([buffer], "data.json"), image];
      const client = makeStorageClient();
      const cid = await client.put(files);
      await createEvent(cid);
    } catch (error) {
      alert(
        `Oops! Something went wrong. Please refresh and try again. Error ${error}`
      );
    } finally {
      setEventName("");
      setEventDescription("");
      setEventLink("");
      setEventCost("");
    }

    async function createEvent(cid) {
      try {
        const rsvpContract = connectContract();

        if (rsvpContract) {
          let deposit = ethers.utils.parseEther(refund);
          let eventDateAndTime = new Date(`${eventDate} ${eventTime}`);
          let eventTimestamp = eventDateAndTime.getTime();
          let eventDataCID = cid;

          const txn = await rsvpContract.createNewEvent(
            eventTimestamp,
            deposit,
            maxCapacity,
            eventCost,
            eventDataCID,
            { gasLimit: 900000 }
          );
          setLoading(true);
          console.log("Minting...", txn.hash);
          let wait = await txn.wait();
          console.log("Minted -- ", txn.hash);

          setEventID(wait.events[0].args[0]);

          setSuccess(true);
          setLoading(false);
          setMessage(
            "Your event has been created successfully. Please note that it may take a few minutes to appear on the home page."
          );
          setTimeout(() => {
            router.push("/");
          }, 5000);
        } else {
          console.log("Error getting contract.");
        }
      } catch (error) {
        setSuccess(false);
        setMessage(`There was an error creating your event: ${error.message}`);
        setLoading(false);
        console.log(error);
      }
    }
    console.log("Form submitted");
  }

  useEffect(() => {
    // disable scroll on <input> elements of type number
    document.addEventListener("wheel", (event) => {
      if (document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    });
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Add your event | EventSky</title>
        <meta
          name="description"
          content="Create your virtual event on the blockchain"
        />
      </Head>
      <section className="relative py-12">
        {loading && (
          <Alert
            alertType={"loading"}
            alertBody={"Please wait"}
            triggerAlert={true}
            color={"white"}
          />
        )}
        {success && (
          <Alert
            alertType={"success"}
            alertBody={message}
            triggerAlert={true}
            color={"palegreen"}
          />
        )}
        {success === false && (
          <Alert
            alertType={"failed"}
            alertBody={message}
            triggerAlert={true}
            color={"palevioletred"}
          />
        )}

        {!success && (
          <div>
            <h1 className="text-3xl tracking-tight font-extralight text-gray-900 sm:text-4xl md:text-5xl mb-4">
              Add Your Virtual Event
            </h1>
            <p className="font-light text-base pr-40 pb-8 pt-8">
              Below you will find a form to add your event. It is free to add
              your event, but a small gas fee is required for the transaction.
              You will need to have a small amount of MATIC in your wallet to
              cover this (usually less than US$0.01). If you do not have a
              wallet, visit{" "}
              <a href="https://metamask.io" className="underline">
                metamask.io
              </a>{" "}
              to create one (also free).
            </p>
          </div>
        )}

        {account && !success && (
          <form
            onSubmit={handleSubmit}
            className="space-y-8 divide-y divide-gray-200"
          >
            <div className="space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                <label
                  htmlFor="eventname"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Event name
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    id="event-name"
                    name="event-name"
                    type="text"
                    className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Date & time
                  <p className="mt-1 max-w-2xl text-sm text-gray-400">
                    Your event date and time
                  </p>
                </label>
                <div className="mt-1 sm:mt-0 flex flex-wrap sm:flex-nowrap gap-2">
                  <div className="w-1/2">
                    <input
                      id="date"
                      name="date"
                      type="date"
                      className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>
                  <div className="w-1/2">
                    <input
                      id="time"
                      name="time"
                      type="time"
                      className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
                      required
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                <label
                  htmlFor="event-cost"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Event Cost
                  <p className="mt-1 max-w-2xl text-sm text-gray-400">
                    Write the cost of your event in US Dollars
                  </p>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    id="event-cost"
                    name="event-cost"
                    type="text"
                    className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                    required
                    value={eventCost}
                    onChange={(e) => setEventCost(e.target.value)}
                    placeholder="15"
                  />
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                <label
                  htmlFor="max-capacity"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Max capacity
                  <p className="mt-1 max-w-2xl text-sm text-gray-400">
                    Limit the number of spots available for your event.
                  </p>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="number"
                    name="max-capacity"
                    id="max-capacity"
                    min="1"
                    placeholder="100"
                    className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                <label
                  htmlFor="refundable-deposit"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Refundable deposit
                  <p className="mt-1 max-w-2xl text-sm text-gray-400">
                    Require a refundable deposit (in MATIC) to reserve one spot
                    at your event
                  </p>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="number"
                    name="refundable-deposit"
                    id="refundable-deposit"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="0.001"
                    className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
                    value={refund}
                    onChange={(e) => setRefund(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                <label
                  htmlFor="event-link"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Event link
                  <p className="mt-1 max-w-2xl text-sm text-gray-400">
                    The link for your virtual event
                  </p>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    id="event-link"
                    name="event-link"
                    type="text"
                    className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                    required
                    value={eventLink}
                    onChange={(e) => setEventLink(e.target.value)}
                  />
                </div>
              </div>
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                <label
                  htmlFor="about"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Event description
                  <p className="mt-2 text-sm text-gray-400">
                    Let people know what your event is about!
                  </p>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea
                    id="about"
                    name="about"
                    rows={3}
                    className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                <label
                  htmlFor="event-link"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Event Image
                  <p className="mt-1 max-w-2xl text-sm text-gray-400">
                    Upload an image for your event
                  </p>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    id="event-image"
                    name="event-image"
                    type="file"
                    className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                    required
                    onChange={(event) => setImage(event.target.files[0])}
                  />
                </div>
              </div>
            </div>
            <div className="pt-5">
              <div className="flex justify-end">
                <Link href="/">
                  <a className="bg-white py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                    Cancel
                  </a>
                </Link>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border-2 border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-black hover:bg-white hover:text-black hover:border-2 border-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        )}
        {/* {success && eventID && (
          <div>
            Success! Please wait a few minutes, then check out your event page{" "}
            <span className="font-bold">
              <Link href={`/event/${eventID}`}>here</Link>
            </span>
          </div>
        )} */}
        {!account && (
          <section className="flex flex-col items-start py-8">
            <p className="mb-4">Please connect your wallet to create events.</p>
            <ConnectButton />
          </section>
        )}
      </section>
    </div>
  );
}

// import { useState, useEffect } from "react";
// import Head from "next/head";
// import Link from "next/link";
// import { ethers } from "ethers";
// import connectContract from "../utils/connectContract";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
// import { useAccount } from "wagmi";
// import Alert from "../components/Alert";
// import { Web3Storage } from "web3.storage";
// import { useRouter } from "next/router";

// function makeStorageClient() {
//   return new Web3Storage({
//     token: process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN,
//   });
// }

// export default function CreateEvent() {
//   const { data: account } = useAccount();
//   const [success, setSuccess] = useState(null);
//   const [message, setMessage] = useState(null);
//   const [loading, setLoading] = useState(null);
//   const [eventID, setEventID] = useState(null);
//   const router = useRouter();

//   const [eventName, setEventName] = useState("Learning about Metamask");
//   const [eventDate, setEventDate] = useState("2022-09-21");
//   const [eventTime, setEventTime] = useState("12:16");
//   const [eventCost, setEventCost] = useState("0.0001");
//   const [maxCapacity, setMaxCapacity] = useState("100");
//   const [refund, setRefund] = useState("0.00005");
//   const [eventLink, setEventLink] = useState("https://onlinecowork.com");
//   const [eventDescription, setEventDescription] = useState(
//     "Learning about metamask"
//   );
//   const [image, setImage] = useState(null);

//   async function handleSubmit(e) {
//     e.preventDefault();

//     const body = {
//       name: eventName,
//       description: eventDescription,
//       link: eventLink,
//       image: "/" + image.name,
//     };

//     try {
//       const buffer = Buffer.from(JSON.stringify(body));
//       const files = [new File([buffer], "data.json"), image];
//       const client = makeStorageClient();
//       const cid = await client.put(files);
//       await createEvent(cid);
//     } catch (error) {
//       alert(
//         `Oops! Something went wrong. Please refresh and try again. Error ${error}`
//       );
//     } finally {
//       setEventName("");
//       setEventDescription("");
//       setEventLink("");
//       setEventCost("");
//     }

//     async function createEvent(cid) {
//       try {
//         const rsvpContract = connectContract();

//         if (rsvpContract) {
//           let deposit = ethers.utils.parseEther(refund);
//           let parsedEventCost = ethers.utils.parseEther(eventCost);
//           let eventDateAndTime = new Date(`${eventDate} ${eventTime}`);
//           let eventTimestamp = eventDateAndTime.getTime();
//           let eventDataCID = cid;

//           console.log({
//             eventTimestamp,
//             deposit,
//             parsedEventCost,
//             maxCapacity,
//             eventDataCID,
//           });

//           const txn = await rsvpContract.createNewEvent(
//             eventTimestamp,
//             deposit,
//             parsedEventCost,
//             maxCapacity,
//             eventDataCID,
//             { gasLimit: 900000 }
//           );
//           setLoading(true);
//           console.log("Minting...", txn.hash);
//           let wait = await txn.wait();
//           console.log("Minted -- ", txn.hash);
//           console.log(wait);

//           // setEventID(wait.events[0].args[0]);

//           setSuccess(true);
//           setLoading(false);
//           setMessage("Your event has been created successfully.");
//           setTimeout(() => {
//             router.push("/");
//           }, 5000);
//         } else {
//           console.log("Error getting contract.");
//         }
//       } catch (error) {
//         setSuccess(false);
//         setMessage(`There was an error creating your event: ${error.message}`);
//         setLoading(false);
//         console.log(error);
//       }
//     }
//     console.log("Form submitted");
//   }

//   useEffect(() => {
//     // disable scroll on <input> elements of type number
//     document.addEventListener("wheel", (event) => {
//       if (document.activeElement.type === "number") {
//         document.activeElement.blur();
//       }
//     });
//   });

//   return (
//     <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
//       <Head>
//         <title>Add your event | EventSky</title>
//         <meta
//           name="description"
//           content="Create your virtual event on the blockchain"
//         />
//       </Head>
//       <section className="relative py-12">
//         {loading && (
//           <Alert
//             alertType={"loading"}
//             alertBody={"Please wait"}
//             triggerAlert={true}
//             color={"white"}
//           />
//         )}
//         {success && (
//           <Alert
//             alertType={"success"}
//             alertBody={message}
//             triggerAlert={true}
//             color={"palegreen"}
//           />
//         )}
//         {success === false && (
//           <Alert
//             alertType={"failed"}
//             alertBody={message}
//             triggerAlert={true}
//             color={"palevioletred"}
//           />
//         )}

//         {!success && (
//           <div>
//             <h1 className="text-3xl tracking-tight font-extralight text-gray-900 sm:text-4xl md:text-5xl mb-4">
//               Add Your Virtual Event
//             </h1>
//             <p className="font-light text-base pr-40 pb-8 pt-8">
//               Below you will find a form to add your event. Please make sure
//               that your event is being hosted online, that it is applicable to
//               an international audience and that it is suitable for all age
//               groups.
//               <br /> <br />
//               Also, please do not include any sensitive information in your
//               event details - such as passwords, phone numbers. Please also be
//               sure that you own the copyright to your event image.
//               <br />
//               <br />
//               You may add any events that you are hosting - such as yoga
//               classes, branding workshops, networking events, online retreats,
//               masterminds, craft workshops, meditation classes and more.
//               <br /> <br />
//               It is free to add your event, but a small gas fee is required for
//               the transaction. You will need to have a small amount of MATIC in
//               your wallet to cover this (usually less than US$0.01)
//               <br /> <br />
//               If you do not have a wallet, visit{" "}
//               <a href="https://metamask.io" className="underline">
//                 metamask.io
//               </a>{" "}
//               to create one (also free).
//               <br /> <br />
//               If you have any questions about this form, please contact
//               hayleyiscoding (@) gmail.com.
//             </p>
//           </div>
//         )}

//         {account && !success && (
//           <form
//             onSubmit={handleSubmit}
//             className="space-y-8 divide-y divide-gray-200"
//           >
//             <div className="space-y-6 sm:space-y-5">
//               <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
//                 <label
//                   htmlFor="eventname"
//                   className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
//                 >
//                   Event name
//                 </label>
//                 <div className="mt-1 sm:mt-0 sm:col-span-2">
//                   <input
//                     id="event-name"
//                     name="event-name"
//                     type="text"
//                     className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
//                     required
//                     value={eventName}
//                     onChange={(e) => setEventName(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
//                 <label
//                   htmlFor="date"
//                   className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
//                 >
//                   Date & time
//                   <p className="mt-1 max-w-2xl text-sm text-gray-400">
//                     Your event date and time
//                   </p>
//                 </label>
//                 <div className="mt-1 sm:mt-0 flex flex-wrap sm:flex-nowrap gap-2">
//                   <div className="w-1/2">
//                     <input
//                       id="date"
//                       name="date"
//                       type="date"
//                       className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
//                       required
//                       value={eventDate}
//                       onChange={(e) => setEventDate(e.target.value)}
//                     />
//                   </div>
//                   <div className="w-1/2">
//                     <input
//                       id="time"
//                       name="time"
//                       type="time"
//                       className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
//                       required
//                       value={eventTime}
//                       onChange={(e) => setEventTime(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
//                 <label
//                   htmlFor="event-cost"
//                   className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
//                 >
//                   Event Cost
//                   <p className="mt-1 max-w-2xl text-sm text-gray-400">
//                     Is your event free or paid? If paid, how much is it?
//                   </p>
//                 </label>
//                 <div className="mt-1 sm:mt-0 sm:col-span-2">
//                   <input
//                     id="event-cost"
//                     name="event-cost"
//                     type="text"
//                     className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
//                     required
//                     value={eventCost}
//                     onChange={(e) => setEventCost(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
//                 <label
//                   htmlFor="max-capacity"
//                   className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
//                 >
//                   Max capacity
//                   <p className="mt-1 max-w-2xl text-sm text-gray-400">
//                     Limit the number of spots available for your event.
//                   </p>
//                 </label>
//                 <div className="mt-1 sm:mt-0 sm:col-span-2">
//                   <input
//                     type="number"
//                     name="max-capacity"
//                     id="max-capacity"
//                     min="1"
//                     placeholder="100"
//                     className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
//                     value={maxCapacity}
//                     onChange={(e) => setMaxCapacity(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
//                 <label
//                   htmlFor="refundable-deposit"
//                   className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
//                 >
//                   Refundable deposit
//                   <p className="mt-1 max-w-2xl text-sm text-gray-400">
//                     Require a refundable deposit (in MATIC) to reserve one spot
//                     at your event
//                   </p>
//                 </label>
//                 <div className="mt-1 sm:mt-0 sm:col-span-2">
//                   <input
//                     type="number"
//                     name="refundable-deposit"
//                     id="refundable-deposit"
//                     min="0"
//                     step="any"
//                     inputMode="decimal"
//                     placeholder="0.00"
//                     className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
//                     value={refund}
//                     onChange={(e) => setRefund(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
//                 <label
//                   htmlFor="event-link"
//                   className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
//                 >
//                   Event link
//                   <p className="mt-1 max-w-2xl text-sm text-gray-400">
//                     The link for your virtual event
//                   </p>
//                 </label>
//                 <div className="mt-1 sm:mt-0 sm:col-span-2">
//                   <input
//                     id="event-link"
//                     name="event-link"
//                     type="text"
//                     className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
//                     required
//                     value={eventLink}
//                     onChange={(e) => setEventLink(e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
//                 <label
//                   htmlFor="about"
//                   className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
//                 >
//                   Event description
//                   <p className="mt-2 text-sm text-gray-400">
//                     Let people know what your event is about!
//                   </p>
//                 </label>
//                 <div className="mt-1 sm:mt-0 sm:col-span-2">
//                   <textarea
//                     id="about"
//                     name="about"
//                     rows={10}
//                     className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
//                     value={eventDescription}
//                     onChange={(e) => setEventDescription(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
//                 <label
//                   htmlFor="event-link"
//                   className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
//                 >
//                   Event Image
//                   <p className="mt-1 max-w-2xl text-sm text-gray-400">
//                     Upload an image for your event
//                   </p>
//                 </label>
//                 <div className="mt-1 sm:mt-0 sm:col-span-2">
//                   <input
//                     id="event-image"
//                     name="event-image"
//                     type="file"
//                     className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
//                     required
//                     onChange={(event) => setImage(event.target.files[0])}
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="pt-5">
//               <div className="flex justify-end">
//                 <Link href="/">
//                   <a className="bg-white py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
//                     Cancel
//                   </a>
//                 </Link>
//                 <button
//                   type="submit"
//                   className="ml-3 inline-flex justify-center py-2 px-4 border-2 border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-black hover:bg-white hover:text-black hover:border-2 border-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
//                 >
//                   Create
//                 </button>
//               </div>
//             </div>
//           </form>
//         )}
//         {success && eventID && (
//           <div>
//             Success! Please wait a few minutes, then check out your event page{" "}
//             <span className="font-bold">
//               <Link href={`/event/${eventID}`}>here</Link>
//             </span>
//           </div>
//         )}
//         {!account && (
//           <section className="flex flex-col items-start py-8">
//             <p className="mb-4">Please connect your wallet to create events.</p>
//             <ConnectButton />
//           </section>
//         )}
//       </section>
//     </div>
//   );
// }
