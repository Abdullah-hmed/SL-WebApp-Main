import { CheckCircle, ChevronRight, Flame, Settings, Target, Calendar, Clock, Trophy } from "lucide-react"


const Header = () => (
    <div className="w-full bg-white shadow-md p-4 mb-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
                <p className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center 
                                text-purple-500 font-bold hover:bg-purple-200 transition-all">{userData.name.split("", 1)}</p>
                <div className="flex flex-col">
                    <h1 className="font-semibold">Welcome Back, <span className="hover:text-purple-800 transition-all">{userData.name}!</span></h1>
                    <div className="flex items-center">
                        <Flame className="w-4 h-4 text-orange-400 hover:text-orange-600 transition-all" />
                        <h3 className="text-gray-600 text-sm">{userData.streak} day streak!</h3>
                    </div>
                </div>
            </div>
            <button>
                <Settings className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-all" />
            </button>
        </div>
    </div>
);


const Card = ({title, description, status}) => {
    const statusStyles = {
        purple: {
            statusColor: 'bg-purple-100',
            statusIconColor: 'text-purple-500',
            cardColor: 'bg-purple-50',
            hoverColor: 'hover:bg-purple-200',
        },
        green: {
            statusColor: 'bg-green-100',
            statusIconColor: 'text-green-500',
            cardColor: 'bg-green-50',
            hoverColor: 'hover:bg-green-200',
        },
        red: {
            statusColor: 'bg-red-100',
            statusIconColor: 'text-red-500',
            cardColor: 'bg-red-50',
            hoverColor: 'hover:bg-red-200',
        },
    };

    const colors = statusStyles[status];

    return (
        <button className="w-full"
            onClick={() => {console.log(title +'\n' + description)}}
        >
            <div className={`flex items-center ${colors.cardColor} ${colors.hoverColor} 
                            shadow-lg rounded-lg p-4 my-2 transition-all duration-200 justify-between`}>
                <div className="flex items-center">
                    <div className={`${colors.statusColor} p-2 rounded-lg mr-3`}>
                        <CheckCircle className={`w-auto h-9 ${colors.statusIconColor}`} />
                    </div>
                    <div className='flex flex-col w-full text-left'>
                        <h2 className='text-2xl font-semibold mb-2'>{title}</h2>
                        <p className='text-gray-600 text-sm'>{description}</p>
                    </div>
                </div>
                <ChevronRight className='w-4 h-4 text-gray-600' />
            </div>
        </button>
    )
}


const ProgressOverview = () => (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Today's Progress</h2>
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
                <Target className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-gray-600">Daily Goal</span>
            </div>
            <span className="text-purple-600 font-medium">{progressMetrics.lessonsComplete}/5 lessons</span>
        </div>
        <div className="w-full bg-gray-100 h-2.5 rounded-full">
            <div className="w-4/5 h-full bg-purple-500 rounded-full" />
        </div>
    </div>
);

const QuickActions = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
        <button className="bg-orange-50 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-orange-100 transition-all shadow-lg">
            <div className="bg-orange-100 p-2 rounded-lg mb-2">
                <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <span className="font-medium text-gray-800">Quick Practice</span>
            <span className="text-sm text-gray-600">5 min lesson</span>
        </button>
        <button className="bg-green-50 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-green-100 transition-all shadow-lg">
            <div className="bg-green-100 p-2 rounded-lg mb-2">
                <Trophy className="w-6 h-6 text-green-500" />
            </div>
            <span className="font-medium text-gray-800">Daily Challenge</span>
            <span className="text-sm text-gray-600">Earn bonus XP</span>
        </button>
    </div>
);

const UpcomingLesson = () => (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex justify-between items-start mb-3">
            <h2 className="text-lg font-semibold">Next Lesson</h2>
            <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">10 min</span>
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <Calendar className="w-5 h-5 text-purple-500 mr-2" />
                <div>
                    <p className="font-medium">Common Phrases</p>
                    <p className="text-sm text-gray-600">Continue where you left off</p>
                </div>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all">
                Start
            </button>
        </div>
    </div>
);

const WeeklyStats = () => (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Weekly Activity</h2>
        <div className="flex items-end h-32 justify-between">
            {progressMetrics.weeklyStats.map((stat) => (
                <div key={stat.day} className="flex flex-col items-center">
                <div 
                    className={`w-8 rounded-t-lg bg-purple-500 hover:bg-purple-600 transition-all duration-200`}
                    style={{ height: `${stat.count * 5}px` }}
                />
                <span className="mt-2 text-sm text-gray-600">{stat.day}</span>
            </div>
            ))}
        </div>
            
        
    </div>
);

const LessonCards = () => (
    <div className="mb-6">
        <div className="flex justify-between">
            <h1 className="text-lg font-semibold text-gray-800 ml-1">Learn ASL</h1>
            <div className="flex items-center gap-2 bg-purple-100 px-3 rounded-full">
                <Flame className="w-4 h-4 text-purple-600 hover:text-purple-800 transition-all" />
                <span className="text-sm font-medium text-purple-600 ">Level {userData.level}</span>
            </div>
        </div>
        <div className="flex flex-col items-center w-full">
            
                {cardData.map((card, index) => (
                    <Card 
                        key={index} 
                        title={card.title} 
                        description={card.description} 
                        status={card.status} 
                    />
                ))}
            
        </div>
    </div>
)

const cardData = [
    {
        title: 'Alphabets',
        description: 'Learn the ASL Alphabets through Fingerspelling.',
        status: 'purple'
    },
    {
        title: 'Numbers',
        description: 'Learn the ASL Numbers.',
        status: 'green'
    },
    {
        title: 'Greetings',
        description: 'Learn Basic Greetings in ASL.',
        status: 'red'
    },
]


const userData = {
    name: 'Diddy',
    level: '69',
    streak: '12'
}


const progressMetrics = {
    lessonsComplete : 3,
    weeklyStats : [
        { day: 'Mon', count: 5 },
        { day: 'Tue', count: 8 },
        { day: 'Wed', count: 12 },
        { day: 'Thu', count: 7 },
        { day: 'Fri', count: 15 },
        { day: 'Sat', count: 20 },
        { day: 'Sun', count: 10 },
    ]
}




function HomeScreen () {
    return (
        <>
            <Header />
            <div className="max-w-screen-md w-full mx-auto px-3">
                <ProgressOverview />
                <QuickActions />
                <UpcomingLesson />
                <LessonCards />
                <WeeklyStats />
            </div>
        </>
    )
}

export default HomeScreen