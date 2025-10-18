export interface Place {
  place_id: string;
  description: string;
   matched_substrings?: any[];
   structured_formatting?:any;
    terms?:any;
     types?:any;
}

export interface Route {
  summary: string;
  overview_polyline: {
    points: string;
  };
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  legs: Array<{
    duration: { text: string; value: number };
    distance: { text: string; value: number };
    start_location: { lat: number; lng: number };
    end_location: { lat: number; lng: number };
    steps: Array<{
      instructions: string;
      distance: { text: string };
      duration: { text: string };
      start_location: { lat: number; lng: number };
    }>;
  }>;
}


