import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from './firebase';
import GitHubCard from './components/GitHubCard';

const SharedStatCard = () => {
  const { statId } = useParams();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const docSnap = await getDoc(doc(db, "stats", statId));
        if (docSnap.exists()) {
          setStatsData(docSnap.data());
        } else {
          setError('Stats not found');
        }
      } catch (err) {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [statId]);

  if (loading) return <div className="text-center py-8">Loading</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="w-full flex flex-col justify-center items-center h-screen bg-black mx-auto p-4">
      <div className='max-w-4xl'>
        <GitHubCard
        username={statsData.username}
        prStats={statsData.prStats}
        commitStats={statsData.commitStats}
        orgStats={statsData.orgStats}
        topRepos={statsData.topRepos}
      />
      </div>
      
    </div>
  );
};

export default SharedStatCard;