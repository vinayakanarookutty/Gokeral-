import  { useState, useEffect } from "react";
import { Car, Truck,  MapPin, Star, Users, ArrowRight, Phone, Mail,Ambulance,Facebook, Instagram, Twitter, CheckCircle } from "lucide-react";
import background_img from "../../assets/Designer.png";
const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const vehicles = [
    { name: "Luxury Cars", icon: Car, count: "50+" },
    { name: "Buses", icon: Truck, count: "30+" },
    { name: "Auto Rickshaw", icon: Car, count: "100+" },
    { name: "Ambulance", icon: Ambulance, count: "200+" }
  ];

  const features = [
    { icon: CheckCircle, title: "24/7 Support", desc: "Round the clock customer service" },
    { icon: MapPin, title: "All Kerala", desc: "Coverage across entire Kerala state" },
    { icon: Star, title: "Top Rated", desc: "4.8+ rating from 10,000+ customers" },
    { icon: Users, title: "Verified Drivers", desc: "All drivers are background verified" }
  ];

  const testimonials = [
    { name: "Arjun Menon", location: "Kochi", rating: 5, text: "Excellent service! Booked a car for Munnar trip. Driver was professional and vehicle was clean." },
    { name: "Priya Nair", location: "Thiruvananthapuram", rating: 5, text: "Best vehicle booking platform in Kerala. Used for my wedding functions. Highly recommended!" },
    { name: "Rahul Krishnan", location: "Kozhikode", rating: 5, text: "Quick booking, fair prices, and reliable service. Will definitely use again for my business trips." }
  ];

  const destinations = [
    { name: "Munnar", image: "https://plus.unsplash.com/premium_photo-1697730314165-2cd71dc3a6a4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { name: "Alleppey", image: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { name: "Palakkad", image: "https://images.unsplash.com/photo-1730458555257-887039de379e?q=80&w=1034&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { name: "Wayanad", image: "https://images.unsplash.com/photo-1572408992122-a530c9a09dbb?q=80&w=839&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              {!isMenuOpen && (
                <>
                  <Car className="h-8 w-8 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">Kerides</span>
                </>
              )}
            </div>
            <nav className="hidden md:flex space-x-8">
              {/* <a href="/" className="text-gray-700 hover:text-green-600 transition-colors">Home</a> */}
              <a href="/driverRegistration" className="text-gray-700 hover:text-green-600 transition-colors">Drivers</a>
              {/* <a href="/register" className="text-gray-700 hover:text-green-600 transition-colors">User</a> */}
              <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
              <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
            </nav>
            <div className="hidden md:flex space-x-4">
              <a className="mt-2" href="/login">   <button className="text-green-600 hover:text-green-700 font-semibold">Login</button></a>
                <a href="/register">  <button className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
                Sign Up
              </button></a>
            
            </div>
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                  Premium Travel Experience
                </span>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Discover Kerala
                  <span className="text-green-600"> in Comfort</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Book any vehicle across Kerala - from luxury cars to auto rickshaws. 
                  Explore God's Own Country with verified drivers and transparent pricing.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/register">
                <button className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg">
                  Book Now <ArrowRight className="inline ml-2 h-5 w-5" />
                </button>
                </a>
                <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-50 transition-colors">
                  Learn More
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-gray-600">Vehicles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-gray-600">Support</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl transform rotate-6"></div>
              <img 
                src={background_img}
                alt="Kerala Vehicle" 
                className="relative rounded-3xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Types */}
      <section id="vehicles" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Vehicle</h2>
            <p className="text-xl text-gray-600">We have the perfect vehicle for every journey in Kerala</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {vehicles.map((vehicle, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <vehicle.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{vehicle.name}</h3>
                <p className="text-gray-600 mb-4">{vehicle.count} Available</p>
               
               
              
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Kerala Rides?</h2>
            <p className="text-xl text-gray-600">Experience the best vehicle booking service in Kerala</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <p className="text-xl text-gray-600">Explore the most beautiful places in Kerala</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinations.map((destination, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-xl font-semibold">{destination.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Read reviews from satisfied customers across Kerala</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg text-gray-600 mb-6 italic">"{testimonials[currentSlide].text}"</p>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonials[currentSlide].name}</h4>
                  <p className="text-gray-500">{testimonials[currentSlide].location}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-green-100 mb-8">Book your perfect vehicle today and explore Kerala in comfort</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register">
            <button className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors">
              Book Vehicle Now
            </button>
            </a>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Download App
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">  
                <Car className="h-8 w-8 text-green-400" />
                <span className="text-2xl font-bold">Kerala Rides</span>
              </div>
              <p className="text-gray-400 mb-4">Your trusted partner for vehicle booking across Kerala. Safe, reliable, and affordable transportation solutions.</p>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Our Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Car Rental</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Bus Booking</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Auto Rickshaw</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Bike Rental</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-400" />
                  <span className="text-gray-400">+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-400" />
                  <span className="text-gray-400">info@keralarides.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-green-400" />
                  <span className="text-gray-400">Kochi, Kerala, India</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">&copy; 2025 Kerala Rides. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Sidebar */}
          <nav
            className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col p-0 rounded-l-3xl overflow-hidden transition-transform duration-300"
            style={{ transform: isMenuOpen ? "translateX(0)" : "translateX(100%)" }}
          >
            {/* Green accent bar and logo */}
            <div className="flex items-center gap-2 px-6 py-6 bg-gradient-to-r from-green-500 to-green-400">
              <Car className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold text-white tracking-wide">Kerides</span>
              <button
                className="ml-auto text-white text-3xl font-light hover:text-green-100"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                &times;
              </button>
            </div>
            {/* Menu links */}
            <div className="flex flex-col gap-2 px-6 py-8 flex-1">
              <a
                href="/driverRegistration"
                className="flex items-center gap-3 text-lg font-semibold text-gray-800 rounded-lg px-3 py-3 hover:bg-green-50 hover:text-green-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <Car className="h-5 w-5 text-green-500" /> Drivers
              </a>
              <a
                href="/contact"
                className="flex items-center gap-3 text-lg font-semibold text-gray-800 rounded-lg px-3 py-3 hover:bg-green-50 hover:text-green-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone className="h-5 w-5 text-green-500" /> Contact
              </a>
              <a
                href="/about"
                className="flex items-center gap-3 text-lg font-semibold text-gray-800 rounded-lg px-3 py-3 hover:bg-green-50 hover:text-green-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-5 w-5 text-green-500" /> About
              </a>
              <a
                href="/login"
                className="flex items-center gap-3 text-lg font-semibold text-green-600 rounded-lg px-3 py-3 hover:bg-green-100 hover:text-green-700 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <ArrowRight className="h-5 w-5 text-green-500" /> Login
              </a>
              <a href="/register" onClick={() => setIsMenuOpen(false)}>
                <button
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold px-6 py-3 rounded-full shadow-lg hover:from-green-600 hover:to-green-700 transition"
                >
                  Sign Up
                </button>
              </a>
            </div>
          </nav>
        </>
      )}
    </div>
  );
};

export default HomePage;
