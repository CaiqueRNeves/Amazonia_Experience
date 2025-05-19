import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getQuizAttempts, getLeaderboard } from '../../redux/slices/quizzesSlice';
import {
  Card,
  Button,
  Table,
  Badge,
  Pagination,
  EmptyState,
  Loader,
  Tabs,
  TabPane,
  Progress
} from '../ui';
import { formatDate } from '../../utils/formatters';

const UserQuizzes = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { attempts, leaderboard, isLoading, error } = useSelector((state) => state.quizzes);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('attempts');

  useEffect(() => {
    dispatch(getQuizAttempts({ page: currentPage, limit: pageSize }));
    dispatch(getLeaderboard());
  }, [dispatch, currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getScoreVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  if (isLoading && !attempts.data?.length) {
    return <Loader />;
  }

  if (error) {
    return (
      <Card className="error-card">
        <h3>{t('common.error')}</h3>
        <p>{error}</p>
        <Button onClick={() => dispatch(getQuizAttempts({ page: currentPage, limit: pageSize }))}>
          {t('common.tryAgain')}
        </Button>
      </Card>
    );
  }

  const renderAttemptsTab = () => {
    if (!attempts.data?.length) {
      return (
        <EmptyState
          icon="book-open"
          title={t('quizzes.noAttempts')}
          description={t('quizzes.noAttemptsDescription')}
          action={
            <Link to="/quizzes">
              <Button variant="primary">{t('quizzes.takeQuiz')}</Button>
            </Link>
          }
        />
      );
    }

    return (
      <>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Cell as="th">{t('quizzes.date')}</Table.Cell>
              <Table.Cell as="th">{t('quizzes.quiz')}</Table.Cell>
              <Table.Cell as="th">{t('quizzes.score')}</Table.Cell>
              <Table.Cell as="th">{t('quizzes.status')}</Table.Cell>
              <Table.Cell as="th">{t('quizzes.amacoins')}</Table.Cell>
              <Table.Cell as="th">{t('common.actions')}</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {attempts.data.map((attempt) => (
              <Table.Row key={attempt.id}>
                <Table.Cell>{formatDate(attempt.started_at)}</Table.Cell>
                <Table.Cell>
                  <div>
                    <strong>{attempt.quiz_title}</strong>
                    <br />
                    <small className="text-muted">
                      {t(`quizzes.difficulty.${attempt.quiz_difficulty}`)}
                    </small>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Progress
                    value={attempt.score || 0}
                    max={100}
                    variant={getScoreVariant(attempt.score)}
                    showText
                  />
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    variant={
                      attempt.status === 'completed'
                        ? 'success'
                        : attempt.status === 'in_progress'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {t(`quizzes.status.${attempt.status}`)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {attempt.status === 'completed' && (
                    <Badge variant="primary">
                      {attempt.amacoins_earned} {t('common.amacoins')}
                    </Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {attempt.status === 'in_progress' ? (
                    <Link to={`/quizzes/${attempt.quiz_id}`}>
                      <Button size="sm" variant="primary">
                        {t('quizzes.continue')}
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/quizzes/${attempt.quiz_id}`}>
                      <Button size="sm" variant="outline">
                        {t('quizzes.tryAgain')}
                      </Button>
                    </Link>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {attempts.totalPages > 1 && (
          <div className="pagination-container mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={attempts.totalPages}
              onPageChange={handlePageChange}
              siblingCount={1}
            />
          </div>
        )}
      </>
    );
  };

  const renderLeaderboardTab = () => {
    if (!leaderboard.data?.length) {
      return (
        <EmptyState
          icon="award"
          title={t('quizzes.noLeaderboard')}
          description={t('quizzes.noLeaderboardDescription')}
        />
      );
    }

    // Encontrar posição do usuário atual no ranking
    const userRanking = leaderboard.data.findIndex(u => u.id === user.id);
    
    return (
      <>
        <div className="user-ranking mb-4">
          <Card variant="highlighted" className="p-3">
            <h3>{t('quizzes.yourRanking')}</h3>
            {userRanking !== -1 ? (
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="mb-0">#{userRanking + 1}</h4>
                  <div className="text-muted">{t('quizzes.outOf', { total: leaderboard.total })}</div>
                </div>
                <div className="text-center">
                  <h4 className="mb-0">{user.quiz_points}</h4>
                  <div className="text-muted">{t('quizzes.points')}</div>
                </div>
                <div className="text-end">
                  <h4 className="mb-0">{leaderboard.data[userRanking].high_scores}</h4>
                  <div className="text-muted">{t('quizzes.highScores')}</div>
                </div>
              </div>
            ) : (
              <p>{t('quizzes.notRanked')}</p>
            )}
          </Card>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Cell as="th">{t('quizzes.rank')}</Table.Cell>
              <Table.Cell as="th">{t('quizzes.user')}</Table.Cell>
              <Table.Cell as="th">{t('quizzes.points')}</Table.Cell>
              <Table.Cell as="th">{t('quizzes.attempts')}</Table.Cell>
              <Table.Cell as="th">{t('quizzes.highScores')}</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {leaderboard.data.map((player, index) => (
              <Table.Row key={player.id} className={player.id === user.id ? 'highlight-row' : ''}>
                <Table.Cell>#{index + 1}</Table.Cell>
                <Table.Cell>
                  <div className="d-flex align-items-center">
                    <div className="user-avatar me-2">
                      {/* Se tiver imagem de avatar, exibir aqui */}
                      {player.id === user.id && (
                        <Badge variant="primary" className="avatar-badge">
                          {t('quizzes.you')}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <div>{player.name}</div>
                      <small>{player.nationality}</small>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>{player.quiz_points}</Table.Cell>
                <Table.Cell>{player.attempts_count}</Table.Cell>
                <Table.Cell>{player.high_scores}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </>
    );
  };

  return (
    <div className="user-quizzes">
      <Card>
        <div className="card-header">
          <h2>{t('quizzes.history')}</h2>
        </div>

        <Tabs active={activeTab} onChange={setActiveTab}>
          <TabPane id="attempts" title={t('quizzes.yourAttempts')}>
            {renderAttemptsTab()}
          </TabPane>
          
          <TabPane id="leaderboard" title={t('quizzes.leaderboard')}>
            {renderLeaderboardTab()}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default UserQuizzes;