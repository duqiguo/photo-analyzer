'use client';

import { useState, useEffect } from 'react';
import { analyzeImage, VisionAPIResponse } from '@/lib/google-vision';

interface GoogleVisionAnalyzerProps {
  imageFile: File | null;
  imageUrl: string | null;
  gpsData?: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function GoogleVisionAnalyzer({ imageFile, imageUrl, gpsData }: GoogleVisionAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true); // Initial state set to analyzing
  const [results, setResults] = useState<VisionAPIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'data'>('description');
  const [mapLocation, setMapLocation] = useState<{lat: number, lng: number} | null>(null);

  // Automatically analyze when imageFile changes
  useEffect(() => {
    if (imageFile) {
      handleAnalyze();
    }
  }, [imageFile]);
  
  // Set map location
  useEffect(() => {
    console.log('Setting map location - GPS data:', gpsData);
    console.log('Setting map location - Analysis results:', results?.landmarkAnnotations);
    
    // Priority use GPS data from EXIF
    if (gpsData && typeof gpsData.latitude === 'number' && typeof gpsData.longitude === 'number') {
      console.log('Using EXIF GPS data:', gpsData.latitude, gpsData.longitude);
      setMapLocation({
        lat: gpsData.latitude,
        lng: gpsData.longitude
      });
    } 
    // Then try to get location from analysis results
    else if (results?.landmarkAnnotations && results.landmarkAnnotations.length > 0 && 
             results.landmarkAnnotations[0].locations && results.landmarkAnnotations[0].locations.length > 0) {
      const { latitude, longitude } = results.landmarkAnnotations[0].locations[0].latLng;
      console.log('Using landmark analysis location:', latitude, longitude);
      setMapLocation({
        lat: latitude,
        lng: longitude
      });
    }
    // If no location info, default to Beijing
    else {
      console.log('Using default location');
      setMapLocation({
        lat: 39.9042,
        lng: 116.4074
      });
    }
  }, [gpsData, results]);

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Please upload an image first');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Immediately call Google Vision API to analyze the image
      const analysisResults = await analyzeImage(imageFile);
      console.log('Google Vision API analysis results:', analysisResults);
      setResults(analysisResults);
      
    } catch (err) {
      setError('Error analyzing image');
      console.error('Error analyzing image:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate description based on analysis results
  const generateDescription = () => {
    if (!results) return '';
    
    let description = '';
    let location = '';
    
    // Extract location information from analysis results
    if (results.landmarkAnnotations && results.landmarkAnnotations.length > 0) {
      location = results.landmarkAnnotations[0].description;
    }
    
    // Analyze people
    const people = results.extendedAnalysis?.people;
    if (people) {
      const count = people.count || 1;
      const gender = people.gender || [];
      const race = people.race || [];
      
      // Section 1: Describe scene, people and location
      description += `In the scene of the photo, there is ${count === 1 ? 'one person' : `${count} individuals`}`;
      description += `${count === 1 ? 's' : ''} `;
      
      // Add environment description
      if (results.labelAnnotations && results.labelAnnotations.length > 0) {
        const environmentLabels = results.labelAnnotations
          .filter(label => ['tree', 'plant', 'water', 'sky', 'mountain', 'grass', 'foliage', 'nature', 
                          '树', '植物', '水', '天空', '山', '草', '叶子', '自然'].includes(label.description.toLowerCase()))
          .map(label => label.description.toLowerCase());
        
        if (environmentLabels.length > 0) {
          description += ' The background is';
          if (environmentLabels.includes('tree') || environmentLabels.includes('plant') || 
              environmentLabels.includes('树') || environmentLabels.includes('植物')) {
            description += ' lush vegetation';
          } else if (environmentLabels.includes('water') || environmentLabels.includes('水')) {
            description += ' calm water';
          } else if (environmentLabels.includes('mountain') || environmentLabels.includes('山')) {
            description += ' majestic mountains';
          } else {
            description += ' natural landscape';
          }
          description += '.';
        } else {
          description += '.';
        }
      } else {
        description += '.';
      }
      
      // Section 2: Describe race and clothing
      if (race.length > 0) {
        description += ` They are likely from the ${race.join(' or ')} race.`;
      }
      
      // Add clothing description
      if (people.clothing && people.clothing.length > 0) {
        description += ` They are wearing ${people.clothing.join(', ')}.`;
      }
      
      // Add expression or emotion
      if (people.emotions && Object.values(people.emotions).length > 0) {
        const emotions = Object.values(people.emotions)[0].split('、')[0];
        description += ` Their expression shows ${emotions === 'Joy' ? 'joy' : 
                            emotions === 'Sorrow' ? 'sadness' : 
                            emotions === 'Anger' ? 'anger' : 
                            emotions === 'Surprise' ? 'surprise' : 
                            emotions === 'Neutral' ? 'neutral' : emotions}.`;
      }

      // Section 3: Income range and political leaning
      if (results.extendedAnalysis?.possibleIncomeRange) {
        const incomeRange = results.extendedAnalysis.possibleIncomeRange;
        description += ` According to visual indicators, they belong to the <span class="font-semibold">${
          incomeRange === 'High Income' ? 'high income' : 
          incomeRange === 'Middle Income' ? 'middle income' : 
          incomeRange === 'Low Income' ? 'low income' : incomeRange
        }</span> group.`;
      }
      
      // Add political leaning
      if (results.extendedAnalysis?.possiblePoliticalAffiliation) {
        const political = results.extendedAnalysis.possiblePoliticalAffiliation;
        description += ` They are likely to lean towards <span class="font-semibold">${
          political === 'Conservative Leaning' ? 'conservative' : 
          political === 'Liberal Leaning' ? 'liberal' : 
          political === 'Neutral/Unknown' ? 'neutral/unknown' : political
        }</span>.`;
      }

      // Section 4: Interests and advertising targets
      if (results.extendedAnalysis?.possibleInterests && results.extendedAnalysis.possibleInterests.length > 0) {
        const interestsMap: Record<string, string> = {
          'Sports': 'sports', 
          'Fashion': 'fashion', 
          'Technology': 'technology',
          'Art': 'art', 
          'Travel': 'travel', 
          'Food': 'food',
          'Nature': 'nature', 
          'Music': 'music', 
          'Reading': 'reading',
          'Fitness': 'fitness'
        };
        
        const translatedInterests = results.extendedAnalysis.possibleInterests.map(
          interest => interestsMap[interest] || interest
        );
        
        description += ` Their possible interests include <span class="font-semibold">${translatedInterests.join(', ')}</span>.`;
      }
      
      if (results.extendedAnalysis?.possibleTargetedAds && results.extendedAnalysis.possibleTargetedAds.length > 0) {
        description += ` Based on visual clues, they may react to ads related to ${results.extendedAnalysis.possibleTargetedAds.slice(0, 3).join(', ')}.`;
      }
    } else {
      // If no people detected, describe the environment
      description = 'This photo shows a scene';
      if (location) {
        description += `, located near <span class="font-semibold">${location}</span>.`;
      } else {
        description += '.';
      }
      
      // Add object description
      if (results.labelAnnotations && results.labelAnnotations.length > 0) {
        const topLabels = results.labelAnnotations.slice(0, 5).map(label => label.description);
        description += ` The main content includes ${topLabels.join(', ')}.`;
      }
      
      // Add color information
      if (results.imagePropertiesAnnotation?.dominantColors?.colors) {
        const colors = results.imagePropertiesAnnotation.dominantColors.colors;
        if (colors.length > 0) {
          const mainColor = colors[0].color;
          const r = mainColor.red || 0;
          const g = mainColor.green || 0;
          const b = mainColor.blue || 0;
          
          let colorName = '';
          if (r > 200 && g < 100 && b < 100) colorName = 'red';
          else if (r < 100 && g > 200 && b < 100) colorName = 'green';
          else if (r < 100 && g < 100 && b > 200) colorName = 'blue';
          else if (r > 200 && g > 200 && b < 100) colorName = 'yellow';
          else if (r > 200 && g < 100 && b > 200) colorName = 'purple';
          else if (r < 100 && g > 200 && b > 200) colorName = 'cyan';
          else if (r > 200 && g > 100 && b < 100) colorName = 'orange';
          else if (r > 200 && g > 200 && b > 200) colorName = 'white';
          else if (r < 100 && g < 100 && b < 100) colorName = 'black';
          else colorName = 'mixed';
          
          description += ` The main color of the image is ${colorName}, accounting for about ${Math.round(colors[0].pixelFraction * 100)}% of the image.`;
        }
      }
      
      // If web detection results exist, add most relevant web content
      if (results.webDetection?.bestGuessLabels && results.webDetection.bestGuessLabels.length > 0) {
        description += ` The most similar network search result for the image content is "${results.webDetection.bestGuessLabels[0].label}".`;
      }
    }
    
    return description;
  };

  if (!imageFile || !imageUrl) {
    return null;
  }

  // Create Google Maps URL with English language setting
  const getGoogleMapUrl = () => {
    if (!mapLocation) return '';
    // Use Google Maps URL format with language parameter set to English
    return `https://maps.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&z=15&output=embed&hl=en&gl=us`;
  };

  return (
    <div className="w-full overflow-hidden bg-black text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left side: Image and Map */}
        <div className="flex flex-col">
          {/* Top part: Image */}
          <div className="flex items-center justify-center bg-black" style={{height: '50vh'}}>
            <img 
              src={imageUrl} 
              alt="Analyzed" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Bottom part: Google Map */}
          <div className="relative" style={{height: '30vh'}}>
            {mapLocation ? (
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src={getGoogleMapUrl()}
                style={{border:0}}
                loading="lazy"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gray-900/70 flex items-center justify-center">
                <p className="text-white text-sm">Loading map...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side: Analysis Results */}
        <div className="flex flex-col h-full">
          {/* Tab switching */}
          <div className="flex bg-gray-800">
            <button
              className={`py-3 px-6 text-lg w-1/2 text-center transition-colors ${
                activeTab === 'description' 
                  ? 'bg-gray-700 text-white font-medium' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`py-3 px-6 text-lg w-1/2 text-center transition-colors ${
                activeTab === 'data' 
                  ? 'bg-gray-700 text-white font-medium' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('data')}
            >
              Data
            </button>
          </div>
          
          {/* Analysis loading state */}
          {isAnalyzing && (
            <div className="flex justify-center items-center p-10 flex-grow">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4"></div>
                <p className="text-gray-300">Analyzing your photo...</p>
              </div>
            </div>
          )}
          
          {/* Content area */}
          {!isAnalyzing && (
            <div className="p-6 overflow-y-auto flex-grow">
              {activeTab === 'description' && results && (
                <div className="space-y-4">
                  {/* Main description content - Using API analysis results */}
                  <div className="text-xl leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: generateDescription() }}></div>
                </div>
              )}
              
              {activeTab === 'data' && results && (
                <div className="space-y-3">
                  {/* 1. People information */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">People</h3>
                    <p>{(results.extendedAnalysis?.people?.count || 1)} {(results.extendedAnalysis?.people?.count || 1) === 1 ? 'person' : 'people'}, 
                      {results.extendedAnalysis?.people?.gender ? ` ${results.extendedAnalysis.people.gender.join(', ')}` : ' Unknown'} 
                      {results.extendedAnalysis?.people?.age ? ` ${results.extendedAnalysis.people.age.join(', ')}` : ' Adult'}
                    </p>
                  </div>
                  
                  {/* 2. Race information */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Race</h3>
                    <p>{results.extendedAnalysis?.people?.race?.length ? results.extendedAnalysis.people.race.join(', ') : 'Unknown'}</p>
                  </div>
                  
                  {/* 4. Emotion */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Emotion</h3>
                    <p>{results.extendedAnalysis?.people?.emotions && Object.keys(results.extendedAnalysis.people.emotions).length > 0 ? 
                      Object.entries(results.extendedAnalysis.people.emotions).map(([person, emotion]) => {
                        const personEN = person.replace('Person', 'Person ');
                        const emotionEN = emotion
                          .replace('Joy', 'Joy')
                          .replace('Sorrow', 'Sorrow')
                          .replace('Anger', 'Anger')
                          .replace('Surprise', 'Surprise')
                          .replace('Neutral', 'Neutral')
                          .replace(', ', ', ');
                        return `${personEN}: ${emotionEN}`;
                      }).join(', ') : 'Person 1: Neutral'}</p>
                  </div>
                  
                  {/* 5. Clothing */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Clothing</h3>
                    <p>{results.extendedAnalysis?.people?.clothing && results.extendedAnalysis.people.clothing.length > 0 ? 
                      results.extendedAnalysis.people.clothing.join(', ') : 'Casual clothing'}</p>
                  </div>
                  
                  {/* 6. Interests */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Interests</h3>
                    <p>{results.extendedAnalysis?.possibleInterests && results.extendedAnalysis.possibleInterests.length > 0 ? 
                      results.extendedAnalysis.possibleInterests.map(interest => 
                        interest === 'Sports' ? 'sports' : 
                        interest === 'Fashion' ? 'fashion' : 
                        interest === 'Technology' ? 'technology' :
                        interest === 'Art' ? 'art' : 
                        interest === 'Travel' ? 'travel' : 
                        interest === 'Food' ? 'food' :
                        interest === 'Nature' ? 'nature' : 
                        interest === 'Music' ? 'music' : 
                        interest === 'Reading' ? 'reading' :
                        interest === 'Fitness' ? 'fitness' :
                        interest === 'General interests' ? 'general interests' : interest).join(', ') : 'general interests'}</p>
                  </div>
                  
                  {/* 7. Political Affiliation */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Political Affiliation</h3>
                    <p>{results.extendedAnalysis?.possiblePoliticalAffiliation ? 
                      (results.extendedAnalysis.possiblePoliticalAffiliation === 'Conservative Leaning' ? 'conservative' : 
                      results.extendedAnalysis.possiblePoliticalAffiliation === 'Liberal Leaning' ? 'liberal' : 
                      results.extendedAnalysis.possiblePoliticalAffiliation === 'Neutral/Unknown' ? 'neutral/unknown' : 
                      results.extendedAnalysis.possiblePoliticalAffiliation) : 'neutral/unknown'}</p>
                  </div>
                  
                  {/* 3. Income Range */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Income Range</h3>
                    <p>{results.extendedAnalysis?.possibleIncomeRange ? 
                      (results.extendedAnalysis.possibleIncomeRange === 'High Income' ? 'high income' : 
                      results.extendedAnalysis.possibleIncomeRange === 'Middle Income' ? 'middle income' : 
                      results.extendedAnalysis.possibleIncomeRange === 'Low Income' ? 'low income' : 
                      results.extendedAnalysis.possibleIncomeRange) : 'middle income'}</p>
                  </div>
                  
                  {/* 8. Possible Target Ads */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Target Ads</h3>
                    <p>{results.extendedAnalysis?.possibleTargetedAds && results.extendedAnalysis.possibleTargetedAds.length > 0 ? 
                      results.extendedAnalysis.possibleTargetedAds.join(', ') : 'General consumer products'}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-900/20 text-red-400 rounded">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 