"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import type { Club } from "@prisma/client";

// Add a type for the club with membership status
interface ClubWithMembership extends Club {
  membershipStatus?: string | null;
}

export default function DiscoverClubsPage() {
  // Define types for API responses
  interface ClubsApiResponse {
    clubs: ClubWithMembership[];
    count?: number;
    message?: string;
  }

  const [clubs, setClubs] = useState<ClubWithMembership[]>([]);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingClubIds, setProcessingClubIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchClubs() {
      try {
        setLoading(true);
        
        // Temporarily using the backup endpoint
        console.log("Fetching clubs data from backup endpoint...");
        const response = await fetch("/api/all-clubs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Prevent caching to get fresh data
            "Cache-Control": "no-cache, no-store"
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error fetching clubs:", response.status, errorText);
          throw new Error(`Failed to fetch clubs: ${response.status}`);
        }
        
        // Parse the response JSON
        const data = await response.json();
        console.log("API response:", data);
        
        // Check if data has clubs property
        if (data && Array.isArray(data.clubs)) {
          setClubs(data.clubs);
        } else if (Array.isArray(data)) {
          // Handle case where API returns array directly
          setClubs(data);
        } else {
          console.error("Unexpected API response format:", data);
          setError("Unexpected data format from API");
          setClubs([]);
        }
      } catch (err) {
        console.error("Error in fetchClubs:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching clubs");
        }
        setClubs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchClubs();
  }, []);

  const handleJoinClub = async (clubId: string) => {
    // Clear any previous errors
    setError(null);
    
    if (status !== "authenticated") {
      setError("You must be signed in to join a club.");
      return;
    }
    
    // Add club ID to processing set to prevent multiple clicks
    setProcessingClubIds(prev => new Set(prev).add(clubId));
    
    try {
      console.log("Sending join request for club ID:", clubId);
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Prevent caching
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify({ 
          clubId
          // action: "join" is now the default in the API
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error("Join club error:", data);
        throw new Error(data.error || "Failed to send join request.");
      }
      
      console.log("Join request successful:", data);

      // Update the UI to reflect the pending status
      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club.id === clubId
            ? { ...club, membershipStatus: "PENDING" }
            : club
        )
      );
      
      // Show success message
      alert("Your club join request has been submitted successfully!");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while joining the club.");
      }
    } finally {
      // Remove club ID from processing set when done
      setProcessingClubIds(prev => {
        const updated = new Set(prev);
        updated.delete(clubId);
        return updated;
      });
    }
  };

  if (status === "loading") {
    return <div className="text-center py-8">Loading session...</div>;
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/images/image2.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark translucent overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-7xl">
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 drop-shadow-2xl mb-4">
            🎵 Discover Clubs 🎵
          </h1>
          <p className="text-white/90 mt-2 text-lg sm:text-xl drop-shadow-lg max-w-2xl mx-auto">
            Explore and join BRAC University clubs - Find your passion, amplify your voice!
          </p>
          <motion.div 
            className="mt-4 text-white/90 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            ✨ {clubs.length} Amazing Clubs Waiting for You ✨
          </motion.div>
        </motion.div>
      
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="mt-2 text-white/90 text-lg">🎪 Loading the amazing clubs...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center text-red-300 py-6 bg-white/10 backdrop-blur-md rounded-lg mb-8 p-6 mx-4 sm:mx-0 border border-white/20">
          <p className="font-medium text-lg text-white/90">⚠️ Error loading clubs</p>
          <p className="text-sm mt-2 text-white/80">{error}</p>
        </div>
      )}
      
      {!loading && clubs.length === 0 && (
        <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-lg shadow-md border border-white/20">
          <Building2 className="h-16 w-16 text-white/90 mx-auto mb-6" />
          <p className="text-white/90 text-lg">🎭 No clubs found. The stage is waiting to be set!</p>
          <p className="text-white/80 text-sm mt-2">The database might need to be seeded with club data.</p>
        </div>
      )}
      
      {clubs.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {clubs.map((club, index) => (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 bg-white/10 backdrop-blur-md text-white/90 rounded-lg shadow-md border border-white/20 hover:border-white/40 relative overflow-hidden group transform hover:scale-105 hover:shadow-xl hover:shadow-white/20">
                {club.logoUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-white/10 to-white/5 relative">
                    <img
                      src={club.logoUrl}
                      alt={`${club.name} logo`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg leading-tight text-slate-100 group-hover:text-white transition-colors">
                    {club.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {club.category && (
                      <Badge variant="outline" className="text-xs bg-white/20 text-white/90 border-white/30 backdrop-blur-sm">
                        🎯 {club.category}
                      </Badge>
                    )}
                    {club.department && (
                      <Badge variant="secondary" className="text-xs bg-white/15 text-white/90 border-white/25">
                        🏛️ {club.department}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between pt-0">
                  <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-4">
                    {club.description}
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handleJoinClub(club.id)}
                      disabled={
                        status !== "authenticated" ||
                        processingClubIds.has(club.id)
                      }
                      className="w-full text-sm bg-white/20 hover:bg-white/30 text-white font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-300"
                      size="sm"
                    >
                      {status !== "authenticated"
                        ? "🔐 Sign in to Join"
                        : processingClubIds.has(club.id)
                        ? "⏳ Processing..."
                        : "🎯 Request to Join"}
                    </Button>
                  </motion.div>
                </CardContent>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-white/10 via-white/5 to-white/10 pointer-events-none"></div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      </div>
    </div>
  );
}
