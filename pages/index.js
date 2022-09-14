import Landing from "../components/Landing";
import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import EventCard from "../components/EventCard";

const UPCOMING_EVENTS = gql`
  query Events {
    events(orderBy: eventTimestamp, orderDirection: desc) {
      id
      name
      eventTimestamp
      imageURL
    }
  }
`;

// const UPCOMING_EVENTS = gql`
//   query Events($currentTimestamp: String) {
//     events(
//       where: { eventTimestamp_gt: $currentTimestamp }
//       orderBy: eventTimestamp
//       orderDirection: desc
//     ) {
//       id
//       name
//       eventTimestamp
//       imageURL
//     }
//   }
// `;

export default function Home() {
  const [currentTimestamp, setCurrentTimestamp] = useState(
    new Date().getTime().toString()
  );

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchText, setSearchText] = useState("");

  const { loading, error, data, refetch } = useQuery(UPCOMING_EVENTS, {
    variables: { currentTimestamp, searchText },
  });

  function searchInputHandler(e) {
    setSearchText(e.target.value);
  }

  function updateFilteredEvents() {
    if (data?.events) {
      if (!searchText) {
        setFilteredEvents(data.events);
      } else {
        setFilteredEvents(
          data.events.filter((event) =>
            event.name.toLowerCase().includes(searchText.toLowerCase())
          )
        );
      }
    }
  }

  function handleClick() {
    updateFilteredEvents();
  }

  useEffect(() => {
    updateFilteredEvents();
  }, [searchText, data]);

  if (loading)
    return (
      <Landing>
        <div className="lds-spinner">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </Landing>
    );
  if (error)
    return (
      <Landing>
        <p>`Error! ${error.message}`</p>
      </Landing>
    );

  return (
    <Landing>
      <div className="flex justify-start pt-4 pb-6">
        <div className="mb-3 xl:w-96">
          <div className="input-group relative flex items-stretch w-full mb-4">
            <input
              type="search"
              className="form-control relative flex-auto min-w-0 block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-black focus:outline-none"
              placeholder="Search"
              aria-label="Search"
              aria-describedby="button-addon2"
              onChange={searchInputHandler}
              value={searchText}
            />
            <button
              className="btn px-6 py-2.5 bg-black text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-gray-400 hover:shadow-lg focus:bg-gray-400  focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-400 active:shadow-lg transition duration-150 ease-in-out flex items-center"
              type="button"
              id="button-addon2"
              onClick={handleClick}
            >
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="search"
                className="w-4"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ul
        role="list"
        className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
      >
        {filteredEvents.map((event) => (
          <li key={event.id}>
            <EventCard
              id={event.id}
              name={event.name}
              eventTimestamp={event.eventTimestamp}
              imageURL={event.imageURL}
              eventCost={event.cost}
            />
          </li>
        ))}
      </ul>
    </Landing>
  );
}
