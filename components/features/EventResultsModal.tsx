'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { MapPin, Calendar, ExternalLink, Search } from 'lucide-react';
import { getConcertUaSearchUrl, getKontramarkaSearchUrl } from '@/lib/ticketAggregator';

interface Event {
  id: string;
  artistName: string;
  venue: string;
  date: string;
  time?: string;
  location: string;
  ticketUrl?: string;
  source: string;
}

interface EventResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events?: Event[];
  loading?: boolean;
  artistsWithoutEvents?: string[];
}

export default function EventResultsModal({
  isOpen,
  onClose,
  events = [],
  loading = false,
  artistsWithoutEvents = [],
}: EventResultsModalProps) {
  const hasEvents = events.length > 0;
  const hasArtistsWithoutEvents = artistsWithoutEvents.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upcoming Events">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Finding events matching your taste...</p>
          <p className="text-sm text-gray-500 mt-2">Searching Concert.ua, Kontramarka, and Karabas...</p>
        </div>
      ) : !hasEvents && !hasArtistsWithoutEvents ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#2D2D2D] mb-2">No Gigs Found</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any upcoming events for your favorite artists.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Try analyzing more playlists or check back later as new events are added daily.
          </p>
          <button
            onClick={onClose}
            className="btn-purple"
          >
            Analyze More Playlists
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Events Found */}
          {hasEvents && (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-2xl p-4 hover:shadow-card transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-[#2D2D2D] mb-1">
                        {event.artistName}
                      </h3>
                      <p className="text-brand-purple font-medium">
                        {event.venue}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                      {event.source}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {event.time && ` at ${event.time}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {event.ticketUrl ? (
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-brand-orange text-white rounded-xl hover:bg-[#F77420] transition-colors duration-200 font-medium"
                    >
                      <span>Get Tickets</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <a
                        href={getConcertUaSearchUrl(event.artistName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-brand-orange text-brand-orange rounded-xl hover:bg-orange-50 transition-colors duration-200 text-sm font-medium"
                      >
                        <Search className="w-4 h-4" />
                        <span>Concert.ua</span>
                      </a>
                      <a
                        href={getKontramarkaSearchUrl(event.artistName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-brand-purple text-brand-purple rounded-xl hover:bg-purple-50 transition-colors duration-200 text-sm font-medium"
                      >
                        <Search className="w-4 h-4" />
                        <span>Kontramarka</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Artists Without Events */}
          {hasArtistsWithoutEvents && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-[#2D2D2D] mb-3">No Gigs Found For:</h4>
              <div className="space-y-2">
                {artistsWithoutEvents.slice(0, 10).map((artist, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-sm text-gray-700">{artist}</span>
                    <div className="flex gap-2">
                      <a
                        href={getConcertUaSearchUrl(artist)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs border border-brand-orange text-brand-orange rounded-lg hover:bg-orange-50 transition-colors font-medium"
                      >
                        Concert.ua
                      </a>
                      <a
                        href={getKontramarkaSearchUrl(artist)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs border border-brand-purple text-brand-purple rounded-lg hover:bg-purple-50 transition-colors font-medium"
                      >
                        Kontramarka
                      </a>
                    </div>
                  </div>
                ))}
                {artistsWithoutEvents.length > 10 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    And {artistsWithoutEvents.length - 10} more artists...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {hasEvents && (
            <div className="border-t border-gray-200 pt-6">
              <p className="text-center text-sm text-gray-500">
                Showing {events.length} upcoming event{events.length !== 1 ? 's' : ''} matching your music taste
              </p>
              <p className="text-center text-xs text-gray-400 mt-2">
                Sources: Concert.ua, Kontramarka, Karabas
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
