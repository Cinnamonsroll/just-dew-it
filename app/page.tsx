"use client";

import { useState, useEffect, useMemo } from "react";
import flavorsDataRaw from "../data/flavors.json";
import Image from "next/image";

const flavorsData = flavorsDataRaw as Flavor[];

interface Flavor {
  name: string;
  countries: string[];
  discontinued: boolean;
}

interface FilterState {
  searchQuery: string;
  excludeDiet: boolean;
  excludeKickstart: boolean;
  excludeHard: boolean;
  excludeGameFuel: boolean;
  excludeDiscontinued: boolean;
  includedCountries: Set<string>;
  countriesExpanded: boolean;
}

export default function Home() {
  const [triedFlavors, setTriedFlavors] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    excludeDiet: false,
    excludeKickstart: false,
    excludeHard: false,
    excludeGameFuel: false,
    excludeDiscontinued: false,
    includedCountries: new Set(),
    countriesExpanded: false,
  });

  useEffect(() => {
    const savedTried = localStorage.getItem("mtn-dew-tried");
    const savedFilters = localStorage.getItem("mtn-dew-filters");

    if (savedTried) {
      setTriedFlavors(new Set(JSON.parse(savedTried)));
    }

    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      setFilters({
        ...parsed,
        includedCountries: new Set(parsed.includedCountries || []),
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(
        "mtn-dew-tried",
        JSON.stringify(Array.from(triedFlavors))
      );
    }, 100);
    return () => clearTimeout(timer);
  }, [triedFlavors]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const toSave = {
        ...filters,
        includedCountries: Array.from(filters.includedCountries),
      };
      localStorage.setItem("mtn-dew-filters", JSON.stringify(toSave));
    }, 100);
    return () => clearTimeout(timer);
  }, [filters]);

  const toggleFlavor = (flavor: string) => {
    setTriedFlavors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(flavor)) {
        newSet.delete(flavor);
      } else {
        newSet.add(flavor);
      }
      return newSet;
    });
  };

  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    flavorsData.forEach((flavor) => {
      flavor.countries.forEach((country) => countrySet.add(country));
    });
    return Array.from(countrySet).sort();
  }, []);

  const toggleCountryInclude = (country: string) => {
    setFilters((prev) => {
      const newCountries = new Set(prev.includedCountries);
      if (newCountries.has(country)) {
        newCountries.delete(country);
      } else {
        newCountries.add(country);
      }
      return { ...prev, includedCountries: newCountries };
    });
  };

  const filteredFlavors = useMemo(() => {
    const query = filters.searchQuery.toLowerCase();
    return flavorsData.filter((flavor) => {
      if (query) {
        const matchesName = flavor.name.toLowerCase().includes(query);
        const matchesCountry = flavor.countries.some((c) =>
          c.toLowerCase().includes(query)
        );
        const matchesDiscontinued =
          flavor.discontinued && "discontinued".includes(query);
        if (!matchesName && !matchesCountry && !matchesDiscontinued)
          return false;
      }
      if (
        filters.includedCountries.size > 0 &&
        !flavor.countries.some((c) => filters.includedCountries.has(c))
      )
        return false;
      if (filters.excludeDiet && flavor.name.toLowerCase().includes("diet"))
        return false;
      if (
        filters.excludeKickstart &&
        flavor.name.toLowerCase().includes("kickstart")
      )
        return false;
      if (filters.excludeHard && flavor.name.toLowerCase().includes("hard"))
        return false;
      if (
        filters.excludeGameFuel &&
        flavor.name.toLowerCase().includes("game fuel")
      )
        return false;
      if (filters.excludeDiscontinued && flavor.discontinued) return false;
      return true;
    });
  }, [filters]);

  const triedCount = useMemo(() => {
    return filteredFlavors.filter((flavor) => triedFlavors.has(flavor.name))
      .length;
  }, [filteredFlavors, triedFlavors]);

  const totalCount = filteredFlavors.length;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="fixed top-4 left-4 z-50">
        <a
          href="https://pancake.wtf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-[#97d700] transition-colors flex items-center gap-1"
        >
          Made with{" "}
          <Image
            src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f95e.svg"
            alt="pancake"
            className="inline-block w-3.5 h-3.5"
          />{" "}
          and{" "}
          <Image
            src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2764.svg"
            alt="heart"
            className="inline-block w-3.5 h-3.5"
          />{" "}
          by Pancake
        </a>
      </div>

      <header className="py-6 md:py-8 px-4 border-b border-[#2a2a2a] relative">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Just <span className="text-[#97d700]">Dew</span> it
          </h1>
          <p className="text-gray-400 text-sm md:text-base text-center">
            A site to check off every{" "}
            <span className="text-[#97d700]">Mountain Dew</span> you&apos;ve had
          </p>
          <div className="hidden md:block absolute top-6 right-4">
            <div className="bg-[#2a2a2a] rounded-xl px-6 py-3 border-2 border-[#97d700]">
              <div className="text-center">
                <div className="text-3xl font-black text-[#97d700]">
                  {triedCount}
                  <span className="text-lg font-bold text-gray-400">
                    {" "}
                    / {totalCount}
                  </span>
                </div>
                <div className="text-gray-300 text-[10px] font-bold uppercase tracking-wider">
                  Tried
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <div className="mb-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#97d700]"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search flavors..."
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-3 bg-[#2a2a2a] border-2 border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#97d700] transition-all text-base"
            />
          </div>
        </div>

        <div className="mb-3 p-3 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
          <h3 className="text-xs font-bold text-[#97d700] mb-2 uppercase tracking-wide">
            Filters
          </h3>

          <div className="mb-2">
            <div className="text-[10px] text-gray-400 mb-1.5 font-semibold">
              Exclude:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    excludeDiet: !prev.excludeDiet,
                  }))
                }
                className={`px-2.5 py-1 rounded-md font-semibold transition-all text-[11px] ${
                  filters.excludeDiet
                    ? "bg-[#97d700] text-black"
                    : "bg-[#1a1a1a] text-gray-300 border border-[#3a3a3a] hover:border-[#97d700]"
                }`}
              >
                Diet
              </button>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    excludeKickstart: !prev.excludeKickstart,
                  }))
                }
                className={`px-2.5 py-1 rounded-md font-semibold transition-all text-[11px] ${
                  filters.excludeKickstart
                    ? "bg-[#97d700] text-black"
                    : "bg-[#1a1a1a] text-gray-300 border border-[#3a3a3a] hover:border-[#97d700]"
                }`}
              >
                Kickstart
              </button>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    excludeHard: !prev.excludeHard,
                  }))
                }
                className={`px-2.5 py-1 rounded-md font-semibold transition-all text-[11px] ${
                  filters.excludeHard
                    ? "bg-[#97d700] text-black"
                    : "bg-[#1a1a1a] text-gray-300 border border-[#3a3a3a] hover:border-[#97d700]"
                }`}
              >
                Hard
              </button>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    excludeGameFuel: !prev.excludeGameFuel,
                  }))
                }
                className={`px-2.5 py-1 rounded-md font-semibold transition-all text-[11px] ${
                  filters.excludeGameFuel
                    ? "bg-[#97d700] text-black"
                    : "bg-[#1a1a1a] text-gray-300 border border-[#3a3a3a] hover:border-[#97d700]"
                }`}
              >
                Game Fuel
              </button>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    excludeDiscontinued: !prev.excludeDiscontinued,
                  }))
                }
                className={`px-2.5 py-1 rounded-md font-semibold transition-all text-[11px] ${
                  filters.excludeDiscontinued
                    ? "bg-[#97d700] text-black"
                    : "bg-[#1a1a1a] text-gray-300 border border-[#3a3a3a] hover:border-[#97d700]"
                }`}
              >
                Discontinued
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  countriesExpanded: !prev.countriesExpanded,
                }))
              }
              className="w-full flex items-center justify-between text-[10px] text-gray-400 mb-1.5 font-semibold hover:text-[#97d700] transition-colors"
            >
              <span>
                Include Countries{" "}
                {filters.includedCountries.size > 0 &&
                  `(${filters.includedCountries.size})`}
              </span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  filters.countriesExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`transition-all duration-200 ease-in-out overflow-hidden ${
                filters.countriesExpanded
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-wrap gap-1.5 pt-1">
                {countries.map((country) => (
                  <button
                    key={country}
                    onClick={() => toggleCountryInclude(country)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      filters.includedCountries.has(country)
                        ? "bg-[#97d700] text-black"
                        : "bg-[#1a1a1a] text-gray-300 border border-[#3a3a3a] hover:border-[#97d700]"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden mb-4">
          <div className="bg-[#2a2a2a] rounded-xl p-4 border-2 border-[#97d700]">
            <div className="text-center mb-3">
              <div className="text-4xl font-black text-[#97d700]">
                {triedCount}
                <span className="text-xl font-bold text-gray-400">
                  {" "}
                  / {totalCount}
                </span>
              </div>
              <div className="text-gray-300 text-xs font-bold uppercase tracking-wider">
                Tried
              </div>
            </div>
            <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden border border-[#3a3a3a]">
              <div
                className="bg-[#97d700] h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${
                    totalCount > 0 ? (triedCount / totalCount) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFlavors.map((flavor) => {
            const isTried = triedFlavors.has(flavor.name);
            return (
              <button
                key={`${flavor.name}-${filters.searchQuery}-${filters.includedCountries.size}`}
                onClick={() => toggleFlavor(flavor.name)}
                className={`p-3 rounded-lg border-2 text-left transition-all flavor-item flavor-fade-in ${
                  isTried
                    ? "bg-[#97d700] border-[#97d700] text-black checked"
                    : "bg-[#2a2a2a] border-[#3a3a3a] text-white hover:border-[#97d700]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isTried ? "bg-black border-black" : "border-[#4a4a4a]"
                    }`}
                  >
                    {isTried && (
                      <svg
                        className="w-3 h-3 text-[#97d700] checkmark"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`font-medium block ${
                        isTried ? "font-bold" : ""
                      }`}
                    >
                      {isTried ? (
                        <span className="line-through-animated">
                          {flavor.name}
                        </span>
                      ) : (
                        flavor.name
                      )}
                    </span>
                    <span className="text-xs opacity-70 mt-1 block">
                      {flavor.countries.join(", ")}
                      {flavor.discontinued && " • Discontinued"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filteredFlavors.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            No flavors found.
          </div>
        )}
      </div>
    </div>
  );
}
