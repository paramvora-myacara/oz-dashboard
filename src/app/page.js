"use client";

// src/app/page.js

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import SlideContainer from "@/components/SlideContainer";
import ModernKpiDashboard from "@/components/ModernKpiDashboard";
import ClientOZMapLoader from "@/components/ClientOZMapLoader";
import OZInvestmentReasons from "@/components/OZInvestmentReasons";
import SourcesModal from "@/components/SourcesModal";
import ExitPopup from "@/components/ExitPopup";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [cameFromSlide, setCameFromSlide] = useState(null);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Exit intent detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Helper to show popup only once per session
    const showPopupIfNotShown = () => {
      if (!sessionStorage.getItem("exitPopupShown")) {
        setShowExitPopup(true);
        sessionStorage.setItem("exitPopupShown", "true");
        // Remove dummy state for Back works
        window.history.back();
      }
    };

    if (!loading && !user) {
      // Push a dummy state to the history stack to detect Back navigation using navigation guestures, trackpad, keyboard, etc.
      window.history.pushState({ page: "homepage" }, "", window.location.href);
      if (isMobile) {
        // For mobile and navigation gestures (including trackpad/keyboard navigation)
        const handlePopState = (e) => {
          showPopupIfNotShown();
        };
        window.addEventListener("popstate", handlePopState);

        return () => {
          window.removeEventListener("popstate", handlePopState);
        };
      } else {
        // For desktop, use mouseleave event to detect exit intent
        const handleMouseLeave = (e) => {
          console.log("Mouse leave detected:", e.clientY);
          if (e.clientY < 0) {
            showPopupIfNotShown();
          }
        };
        document.addEventListener("mouseleave", handleMouseLeave);

        // Also catch navigation gestures (trackpad/keyboard) on desktop
        const handlePopState = (e) => {
          showPopupIfNotShown();
        };
        window.addEventListener("popstate", handlePopState);

        return () => {
          document.removeEventListener("mouseleave", handleMouseLeave);
          window.removeEventListener("popstate", handlePopState);
        };
      }
    }
  }, [loading, user]);

  // Callback from SlideContainer
  const handleSlideChange = useCallback((from, to) => {
    setCameFromSlide(from);
  }, []);

  const openSourcesModal = () => setIsSourcesModalOpen(true);
  const closeSourcesModal = () => setIsSourcesModalOpen(false);

  // Local component to ensure slide 2 opens scrolled to bottom
  const InvestmentReasonsSlide = ({ navigateToSlide, cameFrom }) => {
    const containerRef = useRef(null);

    // Set initial scroll position BEFORE first paint to avoid visible jump
    useLayoutEffect(() => {
      if (!containerRef.current) return;
      if (cameFrom === 2) {
        // Coming from slide 3 → scroll bottom
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      } else {
        // Ensure at top
        containerRef.current.scrollTop = 0;
      }
    }, [cameFrom]);

    return (
      <div
        ref={containerRef}
        data-scroll="true"
        className="h-full w-full bg-white dark:bg-black overflow-y-auto flex flex-col"
      >
        <div className="flex-1">
          <OZInvestmentReasons />
        </div>
        {/* Navigation hints positioned in bottom right */}
        <div className="fixed bottom-20 md:bottom-8 right-8 md:right-[calc(35%+2rem)] lg:right-[calc(30%+2rem)] xl:right-[calc(25%+2rem)] z-50 text-center flex gap-4">
          <div
            className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm text-black/60 dark:text-white/60 flex items-center justify-center gap-2 cursor-pointer hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300"
            onClick={() => navigateToSlide(0)}
          >
            <svg
              className="w-4 h-4 animate-bounce flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animationDuration: "1.5s" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7 7 7"
              />
            </svg>
            <span className="leading-none">Back to map</span>
          </div>
          <div
            className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm text-black/60 dark:text-white/60 flex items-center gap-2 cursor-pointer hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300"
            onClick={() => navigateToSlide(2)}
          >
            <span>Market overview</span>
            <svg
              className="w-4 h-4 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animationDuration: "1.5s" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Define slides for the slide deck with navigation callbacks
  const createSlides = (navigateToSlide) => [
    {
      id: "map",
      title: "Opportunity Zone Map",
      component: (
        <div
          className="h-full w-full overflow-y-auto scroll-container md:overflow-hidden"
          data-scroll="true"
        >
          <ClientOZMapLoader onNavigate={navigateToSlide} />
        </div>
      ),
    },
    {
      id: "investment-reasons",
      title: "Why Invest in OZs",
      component: (
        <InvestmentReasonsSlide
          navigateToSlide={navigateToSlide}
          cameFrom={cameFromSlide}
        />
      ),
    },
    {
      id: "overview",
      title: "Market Overview",
      component: (
        <div
          className="h-full w-full bg-white dark:bg-black overflow-y-auto flex flex-col"
          data-scroll="true"
        >
          {/* Market overview content */}
          <div className="flex-1">
            <ModernKpiDashboard />
          </div>
          {/* Navigation hints positioned in bottom right of overview */}
          <div className="fixed bottom-20 md:bottom-8 right-8 md:right-[calc(35%+2rem)] lg:right-[calc(30%+2rem)] xl:right-[calc(25%+2rem)] z-50 text-center flex gap-4">
            <div
              className="bg-black/5 md:bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm text-black/60 dark:text-white/60 flex items-center gap-2 cursor-pointer hover:bg-black/10 md:hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300"
              onClick={openSourcesModal}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Sources</span>
            </div>
            <div
              className="bg-black/5 md:bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm text-black/60 dark:text-white/60 flex items-center gap-2 cursor-pointer hover:bg-black/10 md:hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300"
              onClick={() => navigateToSlide(1)}
            >
              <span>Back to investment reasons</span>
              <svg
                className="w-4 h-4 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ animationDuration: "1.5s" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7 7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <SlideContainer slides={createSlides} onSlideChange={handleSlideChange} />
      <SourcesModal isOpen={isSourcesModalOpen} onClose={closeSourcesModal} />
      <ExitPopup open={showExitPopup} onClose={() => setShowExitPopup(false)} />
    </>
  );
}
