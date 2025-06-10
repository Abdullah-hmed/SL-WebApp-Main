import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { UserCircle, RefreshCw, LogOut, TrendingUp, BarChart3, Calendar, Brain } from 'lucide-react';
import { getUserData, refreshUserData, logoutUser } from "../utils/authUtils";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line,
} from 'recharts';



const COLORS = {
    primary: '#8b5cf6',    // purple-600
    secondary: '#06b6d4',  // cyan-600  
    accent: '#10b981',     // emerald-600
    warning: '#f59e0b',    // amber-600
    danger: '#ef4444',     // red-500
    light: '#f3f4f6',      // gray-100
    dark: '#374151'        // gray-700
};

const BACKEND_BASE_URL = 'http://localhost:5000/db';

function AccountScreen() {
    const navigate = useNavigate();

    const [userData, setUserData] = useState(() => getUserData());

    // State for dashboard chart and summary data
    const [dashboardData, setDashboardData] = useState({
        flashcardsByBox: [],
        dailyActivity: [],
        upcomingReviews: [],
        loading: true,
        error: null
    });

    // Fetches all necessary dashboard data from the backend
    const fetchDashboardChartsData = useCallback(async () => {
        if (!userData?.id) {
            setDashboardData(prev => ({
                ...prev,
                loading: false,
                error: "User data not available. Please log in."
            }));
            return;
        }

        setDashboardData(prev => ({ ...prev, loading: true, error: null }));

        try {
            const userId = userData.id;

            const [flashcardsRes, dailyActivityRes, upcomingRes] = await Promise.all([
                fetch(`${BACKEND_BASE_URL}/flashcards_by_box_level`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                }),
                fetch(`${BACKEND_BASE_URL}/daily_review_activity`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                }),
                fetch(`${BACKEND_BASE_URL}/upcoming_reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                })
            ]);

            const [flashcardsData, dailyActivityData, upcomingData] = await Promise.all([
                flashcardsRes.ok ? flashcardsRes.json() : Promise.reject(new Error('Failed to fetch flashcards data')),
                dailyActivityRes.ok ? dailyActivityRes.json() : Promise.reject(new Error('Failed to fetch daily activity data')),
                upcomingRes.ok ? upcomingRes.json() : Promise.reject(new Error('Failed to fetch upcoming reviews data'))
            ]);

            console.log("Raw flashcardsData:", flashcardsData);
            console.log("Raw dailyActivityData:", dailyActivityData);
            console.log("Raw upcomingData:", upcomingData);

            setDashboardData({
                flashcardsByBox: flashcardsData || [],
                dailyActivity: dailyActivityData || [],
                upcomingReviews: upcomingData || [],
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setDashboardData(prev => ({
                ...prev,
                loading: false,
                error: error.message || 'Failed to load dashboard data. Please try again.'
            }));
            console.log('Error details:', error);
        }
    }, [userData]);

    useEffect(() => {
        fetchDashboardChartsData();
    }, [fetchDashboardChartsData]); // Depend on the memoized function

    // Handles refreshing user data and re-fetching dashboard data
    const handleRefresh = async () => {
        setDashboardData(prev => ({ ...prev, loading: true })); // Indicate loading
        await refreshUserData(); // This updates local storage/token
        setUserData(getUserData()); // Re-read updated user data from local storage
        // The useEffect depending on fetchDashboardChartsData will trigger the re-fetch
    };

    // Handles user logout
    const handleLogout = () => {
        logoutUser(navigate);
        setUserData(null); // Clear user data in state
        setDashboardData({ // Reset dashboard data
            flashcardsByBox: [],
            dailyActivity: [],
            upcomingReviews: [],
            loading: false,
            error: null
        });
    };

    // Calculate summary statistics
    const calculateStats = useCallback(() => {
        const totalFlashcards = dashboardData.flashcardsByBox.reduce((sum, box) => sum + (box.card_count || 0), 0);
        const today = new Date().toISOString().split('T')[0];
        const todayReviews = dashboardData.dailyActivity.find(day => day.review_date === today)?.reviewed_flashcards_count || 0;
        // Calculate number of reviews due tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const upcomingCount = dashboardData.upcomingReviews
            .filter(item => item.due_date === tomorrowStr)
            .reduce((sum, item) => sum + (item.flashcards_due_count || 0), 0);
        
        return { totalFlashcards, todayReviews, upcomingCount };
    }, [dashboardData]); // Recalculate if dashboardData changes

    const stats = calculateStats();

    if (!userData) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
                <div className='text-center'>
                    <p className="text-gray-500">Please log in to view your account details and dashboard.</p>
                    <button
                        className="mt-4 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition-colors"
                        onClick={() => navigate('/login')}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='max-w-screen-md w-full mx-auto px-3 pb-20 pt-4'>
            <div className='max-w-6xl mx-auto space-y-6'>
                {/* User Info Card */}
                <div className='bg-white rounded-xl shadow-lg p-6'>
                    <div className='flex items-center justify-between flex-wrap gap-4'>
                        <div className='flex items-center gap-4'>
                            <UserCircle className="w-16 h-16 text-purple-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userData.username}!</h1>
                                <p className="text-gray-600">{userData.email}</p>
                            </div>
                        </div>
                        <div className='flex gap-2 flex-wrap'>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 rounded-lg transition-all disabled:opacity-50"
                                onClick={handleRefresh}
                                disabled={dashboardData.loading}
                            >
                                <RefreshCw className={dashboardData.loading ? "animate-spin" : ""} size={16} />
                                Refresh
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg transition-all"
                                onClick={handleLogout}
                            >
                                <LogOut size={16} /> Log Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4'>
                    <StatCard title="Today's Reviews" value={stats.todayReviews} color="purple" />
                    <StatCard title="Upcoming Reviews Tomorrow" value={stats.upcomingCount} color="purple" />
                </div>

                {/* Charts Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Flashcards by Box Level - Bar Chart */}
                    <ChartCard title="Flashcards by Box Level" icon={Brain}>
                        {dashboardData.flashcardsByBox.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                
                                <BarChart data={dashboardData.flashcardsByBox.map(item => ({
                                    box: `Box ${item.box_level}`,
                                    count: item.card_count ?? item.flashcard_count // fallback for both keys
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="box" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" allowDecimals={false} />
                                    <Tooltip contentStyle={{ ...tooltipStyle }} />
                                    <Bar
                                        dataKey="count"
                                        fill={COLORS.primary}
                                        radius={[4, 4, 0, 0]}
                                        name="Flashcards"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <NoDataMessage isLoading={dashboardData.loading} message="No flashcard data available." />
                        )}
                    </ChartCard>

                    <ChartCard title="Daily Review Activity" icon={TrendingUp}>
                        {dashboardData.dailyActivity.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                {/* Show both Line and Bar for daily reviews */}
                                <BarChart data={dashboardData.dailyActivity}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="review_date"
                                        stroke="#6b7280"
                                        tickFormatter={(value) =>
                                            new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        }
                                    />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip
                                        contentStyle={{ ...tooltipStyle }}
                                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                    />
                                    <Bar
                                        dataKey="reviewed_flashcards_count"
                                        fill={COLORS.primary}
                                        radius={[4, 4, 0, 0]}
                                        name="Flashcards Reviewed"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="reviewed_flashcards_count"
                                        stroke={COLORS.primary}
                                        strokeWidth={3}
                                        dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                                        name="Flashcards Reviewed (Line)"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <NoDataMessage isLoading={dashboardData.loading} message="No review activity data available." />
                        )}
                    </ChartCard>
                    <ChartCard title="Upcoming Reviews" icon={Calendar}>
                        {dashboardData.upcomingReviews.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dashboardData.upcomingReviews}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="due_date"
                                        stroke="#6b7280"
                                        tickFormatter={(value) =>
                                            new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        }
                                    />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip
                                        contentStyle={{ ...tooltipStyle }}
                                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                    />
                                    <Bar
                                        dataKey="flashcards_due_count"
                                        fill={COLORS.primary}
                                        radius={[4, 4, 0, 0]}
                                        name="Flashcards Due"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <NoDataMessage isLoading={dashboardData.loading} message="No upcoming reviews." />
                        )}
                    </ChartCard>
                </div>
                {dashboardData.error && (
                    <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Error:</span>
                            <span>{dashboardData.error}</span>
                        </div>
                    </div>
                )}

                {dashboardData.loading && !dashboardData.error && (
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700'>
                        <div className="flex items-center gap-2">
                            <RefreshCw className="animate-spin" size={16} />
                            <span>Loading dashboard data...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AccountScreen;

// Helper Components

function StatCard({ title, value, color }) {
    const colorClasses = {
        purple: 'text-purple-600',
        blue: 'text-blue-600',
        green: 'text-green-600',
        orange: 'text-orange-600',
    };

    return (
        <div className='bg-white rounded-lg shadow p-4 text-center'>
            <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
            <div className='text-gray-600'>{title}</div>
        </div>
    );
}

function ChartCard({ title, icon: Icon, children }) {
    return (
        <div className='bg-white rounded-xl shadow-lg p-6'>
            <div className='flex items-center gap-2 mb-4'>
                <Icon className="text-purple-600" size={20} />
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function NoDataMessage({ isLoading, message }) {
    return (
        <div className="flex items-center justify-center h-[200px] text-gray-500">
            {isLoading ? 'Loading...' : message}
        </div>
    );
}

const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #8b5cf6',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};