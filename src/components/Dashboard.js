import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import '../styles/dashboard.css';
import ParticipantCounter from './ParticipantCounter';
import AgeChart from './AgeChart';
import GenderChart from './GenderChart';
import AttendanceChart from './AttendanceChart';
import EmotionChart from './EmotionChart';
import HLSVideoPlayer from './HLSVideoPlayer';

const Dashboard = ({ detectionData }) => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [topObjectsData, setTopObjectsData] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedCamera, setSelectedCamera] = useState('all');
    const [totalPersons, setTotalPersons] = useState(0);
    const [apiData, setApiData] = useState({
        total_faces: 0,
        gender: { Woman: 0, Man: 0 },
        age_distribution: { "18-25": 0, "26-35": 0, "36-50": 0, "50+": 0 },
        emotions: { happy: 0, neutral: 0, sad: 0, angry: 0 }
    });

    const streamUrl = "http://cuda.sum.ba:8888/person/video1_stream.m3u8";

    const COLORS = [
        '#f99a41', '#3f5a80', '#6f83a0', '#9facc0'
    ];

    // Funkcija za dohvaćanje podataka s API-ja
    const fetchApiData = async () => {
        try {
            console.log("Pozivam API:", 'http://cuda.sum.ba:8081/status');
            const response = await fetch('http://cuda.sum.ba:8081/status');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Primljeni podaci s API-ja:", data);
            setApiData(data);
            setTotalPersons(data.total_faces);
        } catch (error) {
            console.error("Greška pri dohvaćanju API podataka:", error);
        }
    };

    // Dohvati podatke s API-ja prilikom učitavanja komponente
    useEffect(() => {
        // Odmah dohvati podatke pri učitavanju
        console.log("Dohvaćam početne podatke s API-ja");
        fetchApiData();

        // Postavi interval za osvježavanje podataka svakih 30 sekundi
        console.log("Postavljam interval osvježavanja od 30 sekundi");
        const intervalId = setInterval(() => {
            console.log("Osvježavam podatke s API-ja");
            fetchApiData();
        }, 30000); // 30 sekundi

        // Očisti interval kada se komponenta ukloni
        return () => {
            console.log("Čistim interval za dohvat podataka");
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (detectionData) {
            try {
                // Dohvati dostupne godine i kamere
                const years = getAvailableYears(detectionData);
                const cameras = Object.keys(detectionData);

                setAvailableYears(years);
                setAvailableCameras(cameras);

                // Ako još nije odabrana godina, postavi najnoviju
                if (selectedYear === 'all' && years.length > 0) {
                    setSelectedYear(Math.max(...years).toString());
                }

                // Ako još nije odabrana kamera, postavi prvu
                if (selectedCamera === 'all' && cameras.length > 0) {
                    setSelectedCamera('all'); // Zadržavamo 'all' kao default
                }

                // Obradi podatke prema odabranim filterima
                const monthlyStats = processMonthlyData(detectionData, selectedYear, selectedCamera);
                const topObjects = findTopObjects(detectionData, selectedYear, selectedCamera);

                setMonthlyData(monthlyStats);
                setTopObjectsData(topObjects);
            } catch (error) {
                console.error("Greška u obradi podataka:", error);
            }
        }
    }, [detectionData, selectedYear, selectedCamera]);

    // Priprema podataka za prikaz iz API-ja
    const prepareEmotionData = () => {
        return Object.entries(apiData.emotions).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1), // Prvo slovo veliko
            value
        }));
    };

    const prepareGenderData = () => {
        return [
            { name: 'Muški', value: apiData.gender.Man },
            { name: 'Ženski', value: apiData.gender.Woman }
        ];
    };

    const prepareAgeData = () => {
        return Object.entries(apiData.age_distribution).map(([name, value]) => ({
            name,
            value
        }));
    };

    // Funkcija za izračun ukupnog broja osoba
    const calculateTotalPersons = (data, year, camera) => {
        let totalCount = 0;

        try {
            // Filtriraj kamere na temelju odabira
            const camerasToProcess = camera === 'all'
                ? Object.keys(data)
                : [camera];

            // Obradi kamere
            camerasToProcess.forEach(cameraKey => {
                if (!data[cameraKey]) return;
                const cameraData = data[cameraKey];

                // Obradi datume
                Object.keys(cameraData).forEach(dateKey => {
                    const parts = dateKey.split('-');

                    // Provjeri validnost datuma i filtriraj po godini
                    if (parts.length === 3) {
                        const dateYear = parseInt(parts[2]);

                        // Filtriraj po godini ako je odabrana specifična godina
                        if (year === 'all' || dateYear === parseInt(year)) {
                            // Zbroji sve detekcije osoba
                            Object.keys(cameraData[dateKey]).forEach(entryKey => {
                                const entry = cameraData[dateKey][entryKey];
                                if (entry && entry.detection && entry.detection.person) {
                                    totalCount += parseInt(entry.detection.person);
                                }
                            });
                        }
                    }
                });
            });
        } catch (error) {
            console.error("Greška pri izračunu ukupnog broja osoba:", error);
        }

        return totalCount;
    };

    const getAvailableYears = (data) => {
        const yearsSet = new Set();

        try {
            // Dohvati sve jedinstvene godine iz ključeva datuma
            Object.keys(data).forEach(camera => {
                if (!data[camera]) return;
                Object.keys(data[camera]).forEach(dateKey => {
                    const parts = dateKey.split('-');
                    if (parts.length === 3 && !isNaN(parseInt(parts[2]))) {
                        yearsSet.add(parseInt(parts[2]));
                    }
                });
            });
        } catch (error) {
            console.error("Greška pri dohvaćanju dostupnih godina:", error);
        }

        return Array.from(yearsSet).sort();
    };

    const processMonthlyData = (data, year, camera) => {
        // Inicijaliziraj mjesečne podatke
        const monthlyDetections = Array(12).fill().map((_, index) => ({
            name: new Date(2000, index).toLocaleString('default', { month: 'short' }),
            person: 0,
            car: 0,
            month: index,
        }));

        try {
            // Filtriraj kamere na temelju odabira
            const camerasToProcess = camera === 'all'
                ? Object.keys(data)
                : [camera];

            // Obradi kamere
            camerasToProcess.forEach(cameraKey => {
                if (!data[cameraKey]) return;
                const cameraData = data[cameraKey];

                // Obradi datume
                Object.keys(cameraData).forEach(dateKey => {
                    try {
                        const parts = dateKey.split('-');

                        // Provjeri validnost datuma i filtriraj po godini
                        if (parts.length === 3) {
                            const month = parseInt(parts[0]) - 1; // Konverzija u 0-indeksirani mjesec (0-11)
                            const dateYear = parseInt(parts[2]);

                            // Provjeri je li mjesec validan (0-11)
                            if (isNaN(month) || month < 0 || month > 11) {
                                console.warn(`Nevalidan mjesec ${month + 1} za datum ${dateKey}`);
                                return; // Preskoči ovu iteraciju
                            }

                            // Filtriraj po godini ako je odabrana specifična godina
                            if (year === 'all' || dateYear === parseInt(year)) {
                                // Zbroji sve detekcije za ovaj mjesec
                                Object.keys(cameraData[dateKey]).forEach(entryKey => {
                                    const entry = cameraData[dateKey][entryKey];
                                    if (entry && entry.detection) {
                                        if (entry.detection.person) {
                                            monthlyDetections[month].person += parseInt(entry.detection.person);
                                        }
                                        if (entry.detection.car) {
                                            monthlyDetections[month].car += parseInt(entry.detection.car);
                                        }
                                    }
                                });
                            }
                        }
                    } catch (innerError) {
                        console.error(`Greška pri obradi datuma ${dateKey}:`, innerError);
                    }
                });
            });

            console.log('Obrađeni mjesečni podaci:', monthlyDetections);
        } catch (error) {
            console.error("Greška pri obradi mjesečnih podataka:", error);
        }

        return monthlyDetections;
    };

    const findTopObjects = (data, year, camera) => {
        const detectionCounts = {};

        try {
            // Filtriraj kamere na temelju odabira
            const camerasToProcess = camera === 'all'
                ? Object.keys(data)
                : [camera];

            // Obradi kamere
            camerasToProcess.forEach(cameraKey => {
                if (!data[cameraKey]) return;
                const cameraData = data[cameraKey];

                // Obradi datume
                Object.keys(cameraData).forEach(dateKey => {
                    try {
                        const parts = dateKey.split('-');

                        // Provjeri validnost datuma i filtriraj po godini
                        if (parts.length === 3) {
                            const dateYear = parseInt(parts[2]);

                            // Filtriraj po godini ako je odabrana specifična godina
                            if (year === 'all' || dateYear === parseInt(year)) {
                                // Zbroji sve detekcije po tipu objekta
                                Object.keys(cameraData[dateKey]).forEach(entryKey => {
                                    const entry = cameraData[dateKey][entryKey];

                                    if (entry && entry.detection) {
                                        Object.keys(entry.detection).forEach(objectType => {
                                            if (!detectionCounts[objectType]) {
                                                detectionCounts[objectType] = 0;
                                            }
                                            detectionCounts[objectType] += parseInt(entry.detection[objectType] || 0);
                                        });
                                    }
                                });
                            }
                        }
                    } catch (innerError) {
                        console.error(`Greška pri obradi datuma ${dateKey}:`, innerError);
                    }
                });
            });

            // Sortiraj i ograniči na top 5 objekata
            const topObjects = Object.keys(detectionCounts)
                .map(key => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1), // Prvo slovo veliko
                    value: detectionCounts[key]
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10);

            console.log('Top 8 objekata:', topObjects);
            return topObjects;
        } catch (error) {
            console.error("Greška pri pronalaženju top objekata:", error);
            return [];
        }
    };

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const handleCameraChange = (e) => {
        setSelectedCamera(e.target.value);
    };

    return (
        <div className="dashboard-new">
            {/* Gornji dio - mali widgeti posloženi u mrežu */}
            <div className="dashboard-top-cards">
                <ParticipantCounter totalPersons={apiData.total_faces} />
                <AgeChart data={prepareAgeData()} colors={COLORS} />
                <GenderChart data={prepareGenderData()} colors={COLORS} />
                <HLSVideoPlayer streamUrl={streamUrl} />
            </div>

            {/* Donji dio - veliki grafovi u horizontalnom rasporedu */}
            <div className="dashboard-main-cards">
                <div className="card emotion-card">
                    <EmotionChart data={prepareEmotionData()} />
                </div>

                <div className="card chart-card">
                    <h2>BROJ OSOBA I VOZILA PO MJESECU</h2>

                    <div className="chart-filters">
                        <div className="filter-group">
                            <label htmlFor="year-select">Godina:</label>
                            <select
                                id="year-select"
                                value={selectedYear}
                                onChange={handleYearChange}
                                className="filter-select"
                            >
                                <option value="all">Sve godine</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year.toString()}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="camera-select">Kamera:</label>
                            <select
                                id="camera-select"
                                value={selectedCamera}
                                onChange={handleCameraChange}
                                className="filter-select"
                            >
                                <option value="all">Sve kamere</option>
                                {availableCameras.map(camera => (
                                    <option key={camera} value={camera}>Kamera {camera}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={monthlyData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 30,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#555"
                                    tick={{ fontSize: 12 }}
                                    height={40}
                                />
                                <YAxis stroke="#555" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        borderColor: '#ddd',
                                        borderRadius: '5px',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                                    }}
                                    formatter={(value) => [`${value}`, '']}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    wrapperStyle={{ paddingTop: '10px' }}
                                />
                                <Bar
                                    dataKey="person"
                                    name="Osobe"
                                    fill="#f99a41"
                                    barSize={20}
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="car"
                                    name="Vozila"
                                    fill="#3f5a80"
                                    barSize={20}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Treći graf - top 5 objekata */}
                <div className="card chart-card top-card">
                    <h2>TOP 5 DETEKTIRANIH OBJEKATA</h2>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={topObjectsData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 70,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    type="category"
                                    stroke="#555"
                                    tick={{ fontSize: 12 }}
                                    height={60}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis
                                    type="number"
                                    stroke="#555"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        borderColor: '#ddd',
                                        borderRadius: '5px',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                                    }}
                                    formatter={(value) => [`${value} detekcija`, '']}
                                />
                                <Legend />
                                <Bar
                                    dataKey="value"
                                    name="Broj detekcija"
                                    radius={[4, 4, 0, 0]}
                                >
                                    {topObjectsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;