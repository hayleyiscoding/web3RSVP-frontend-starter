import Head from "next/head";
import { useState } from "react";

export default function Landing({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Head>
        <title>EventSky</title>
        <meta
          name="description"
          content="Find, join, and create virtual events with your web3 frens"
        />
      </Head>
      <section className="pt-8">
        <div className="w-full md:w-8/12 text-left">
          <h1 className="font-light text-4xl tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span>Virtual Events Hosted by </span>
            <span className="text-gray-300">Women in Online Business</span>
          </h1>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:mx-auto md:mt-5 md:text-xl lg:mx-0 font-extralight">
            Find, attend and add virtual events! Yoga classes, business
            masterminds, craft workshops, coffee chats and more. No sign-up
            required! Just connect your wallet to get started.
          </p>
        </div>
      </section>
      <section className="py-8">{children}</section>
    </div>
  );
}
