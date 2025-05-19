import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CalendarIcon, MapPinIcon, GiftIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

import { Container, Section } from '../components/layout';
import { EventCard, PlaceCard, RewardCard, QuizCard } from '../components/cards';
import { api } from '../services/api';
import HeroSection from '../components/home/HeroSection';
import FeatureGrid from '../components/home/FeatureGrid';
import MapSection from '../components/home/MapSection';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [topRewards, setTopRewards] = useState([]);
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carrega dados em paralelo para melhor performance
        const [eventsRes, placesRes, rewardsRes, quizzesRes] = await Promise.all([
          api.events.getFeaturedEvents({ limit: 4 }),
          api.places.getPlaces({ limit: 4 }),
          api.rewards.getRewards({ limit: 4 }),
          api.quizzes.getQuizzes({ limit: 4 }),
        ]);

        setFeaturedEvents(eventsRes.events || []);
        setPopularPlaces(placesRes.places || []);
        setTopRewards(rewardsRes.rewards || []);
        setFeaturedQuizzes(quizzesRes.quizzes || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Features da aplicação
  const features = [
    {
      icon: <CalendarIcon className="h-10 w-10 text-amazon-green-600" />,
      title: t('home.features.events.title'),
      description: t('home.features.events.description'),
      link: '/events',
    },
    {
      icon: <MapPinIcon className="h-10 w-10 text-amazon-river-600" />,
      title: t('home.features.places.title'),
      description: t('home.features.places.description'),
      link: '/places',
    },
    {
      icon: <GiftIcon className="h-10 w-10 text-amazon-earth-600" />,
      title: t('home.features.rewards.title'),
      description: t('home.features.rewards.description'),
      link: '/rewards',
    },
    {
      icon: <AcademicCapIcon className="h-10 w-10 text-sustainable-green-600" />,
      title: t('home.features.quizzes.title'),
      description: t('home.features.quizzes.description'),
      link: '/quizzes',
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      <Container>
        {/* Features grid */}
        <FeatureGrid features={features} />

        {/* Eventos em destaque */}
        <Section
          title={t('home.featuredEvents')}
          description={t('home.featuredEventsDescription')}
          viewAllLink="/events"
          viewAllLabel={t('common.viewAll')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, index) => <EventCard.Skeleton key={index} />)
              : featuredEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        </Section>

        {/* Locais populares */}
        <Section
          title={t('home.popularPlaces')}
          description={t('home.popularPlacesDescription')}
          viewAllLink="/places"
          viewAllLabel={t('common.viewAll')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, index) => <PlaceCard.Skeleton key={index} />)
              : popularPlaces.map((place) => <PlaceCard key={place.id} place={place} />)}
          </div>
        </Section>

        {/* Mapa da COP30 */}
        <MapSection />

        {/* Recompensas em destaque */}
        <Section
          title={t('home.topRewards')}
          description={t('home.topRewardsDescription')}
          viewAllLink="/rewards"
          viewAllLabel={t('common.viewAll')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, index) => <RewardCard.Skeleton key={index} />)
              : topRewards.map((reward) => <RewardCard key={reward.id} reward={reward} />)}
          </div>
        </Section>

        {/* Quizzes */}
        <Section
          title={t('home.quizzes')}
          description={t('home.quizzesDescription')}
          viewAllLink="/quizzes"
          viewAllLabel={t('common.viewAll')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, index) => <QuizCard.Skeleton key={index} />)
              : featuredQuizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)}
          </div>
        </Section>

        {/* Banner CTA */}
        <div className="bg-amazon-green-600 text-white rounded-lg p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('home.joinCTA')}</h2>
          <p className="mb-6 max-w-2xl mx-auto">{t('home.joinDescription')}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="bg-white text-amazon-green-600 hover:bg-gray-100 px-6 py-2 rounded-md font-medium inline-block"
              >
                {t('home.viewProfile')}
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-amazon-green-600 hover:bg-gray-100 px-6 py-2 rounded-md font-medium inline-block"
                >
                  {t('auth.register')}
                </Link>
                <Link
                  to="/login"
                  className="border border-white text-white hover:bg-amazon-green-700 px-6 py-2 rounded-md font-medium inline-block"
                >
                  {t('auth.login')}
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Home;