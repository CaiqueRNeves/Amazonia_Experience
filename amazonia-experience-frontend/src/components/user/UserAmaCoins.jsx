import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { getAmacoins, getAmacoinsHistory } from '../../redux/slices/userSlice';
import {
  Card,
  Button,
  Table,
  Badge,
  EmptyState,
  Loader
} from '../ui';
import { formatDate } from '../../utils/formatters';

const UserAmaCoins = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { amacoins, amacoinsHistory, isLoading, error } = useSelector((state) => state.user);
  
  // Estados para filtros
  const [selectedPeriod, setSelectedPeriod] = useState('30days'); // '7days', '30days', '90days', 'all'

  useEffect(() => {
    dispatch(getAmacoins());
    dispatch(getAmacoinsHistory({ period: selectedPeriod }));
  }, [dispatch, selectedPeriod]);

  // Função para formatar dados para o gráfico
  const getChartData = () => {
    if (!amacoinsHistory || !amacoinsHistory.transactions) return [];
    
    // Agrupar transações por dia
    const transactionsByDate = amacoinsHistory.transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          earned: 0,
          spent: 0,
          balance: 0
        };
      }
      
      if (transaction.amount > 0) {
        acc[date].earned += transaction.amount;
      } else {
        acc[date].spent += Math.abs(transaction.amount);
      }
      
      return acc;
    }, {});
    
    // Converter para array e ordenar por data
    const chartData = Object.values(transactionsByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Calcular saldo acumulado
    let balance = amacoinsHistory.startingBalance || 0;
    chartData.forEach(day => {
      balance += day.earned - day.spent;
      day.balance = balance;
    });
    
    return chartData;
  };

  if (isLoading && !amacoins && !amacoinsHistory) {
    return <Loader />;
  }

  if (error) {
    return (
      <Card className="error-card">
        <h3>{t('common.error')}</h3>
        <p>{error}</p>
        <Button onClick={() => dispatch(getAmacoins())}>
          {t('common.tryAgain')}
        </Button>
      </Card>
    );
  }

  return (
    <div className="user-amacoins">
      <div className="row">
        <div className="col-md-12 mb-4">
          <Card className="balance-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3>{t('amacoins.yourBalance')}</h3>
                <div className="balance-amount">
                  <span className="amount">{amacoins || 0}</span>
                  <span className="currency">{t('common.amacoins')}</span>
                </div>
              </div>
              
              <Link to="/rewards">
                <Button variant="primary">{t('amacoins.redeem')}</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-8">
          <Card>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3>{t('amacoins.history')}</h3>
              
              <div className="period-selector">
                <Button
                  size="sm"
                  variant={selectedPeriod === '7days' ? 'primary' : 'outline'}
                  onClick={() => setSelectedPeriod('7days')}
                >
                  {t('amacoins.7days')}
                </Button>
                <Button
                  size="sm"
                  variant={selectedPeriod === '30days' ? 'primary' : 'outline'}
                  onClick={() => setSelectedPeriod('30days')}
                  className="ms-2"
                >
                  {t('amacoins.30days')}
                </Button>
                <Button
                  size="sm"
                  variant={selectedPeriod === '90days' ? 'primary' : 'outline'}
                  onClick={() => setSelectedPeriod('90days')}
                  className="ms-2"
                >
                  {t('amacoins.90days')}
                </Button>
                <Button
                  size="sm"
                  variant={selectedPeriod === 'all' ? 'primary' : 'outline'}
                  onClick={() => setSelectedPeriod('all')}
                  className="ms-2"
                >
                  {t('amacoins.allTime')}
                </Button>
              </div>
            </div>
            
            <div className="chart-container" style={{ height: '300px' }}>
              {getChartData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getChartData()}
                    margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, "AmaCoins"]} />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#8884d8"
                      name={t('amacoins.balance')}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="earned"
                      stroke="#82ca9d"
                      name={t('amacoins.earned')}
                    />
                    <Line
                      type="monotone"
                      dataKey="spent"
                      stroke="#ff7300"
                      name={t('amacoins.spent')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon="bar-chart-2"
                  title={t('amacoins.noData')}
                  description={t('amacoins.noDataDescription')}
                  compact
                />
              )}
            </div>
          </Card>
        </div>
        
        <div className="col-md-4">
          <Card>
            <div className="card-header">
              <h3>{t('amacoins.stats')}</h3>
            </div>
            
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-value">
                  {amacoinsHistory?.earned || 0}
                </div>
                <div className="stat-label">
                  {t('amacoins.totalEarned')}
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-value">
                  {amacoinsHistory?.spent || 0}
                </div>
                <div className="stat-label">
                  {t('amacoins.totalSpent')}
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-value">
                  {amacoinsHistory?.transactions?.length || 0}
                </div>
                <div className="stat-label">
                  {t('amacoins.transactions')}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4>{t('amacoins.earnMoreTitle')}</h4>
              <ul className="earn-more-list">
                <li>
                  <Link to="/events">{t('amacoins.attendEvents')}</Link>
                </li>
                <li>
                  <Link to="/places">{t('amacoins.visitPlaces')}</Link>
                </li>
                <li>
                  <Link to="/quizzes">{t('amacoins.completeQuizzes')}</Link>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-12">
          <Card>
            <div className="card-header">
              <h3>{t('amacoins.recentTransactions')}</h3>
            </div>
            
            {amacoinsHistory?.transactions?.length > 0 ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Cell as="th">{t('amacoins.date')}</Table.Cell>
                    <Table.Cell as="th">{t('amacoins.description')}</Table.Cell>
                    <Table.Cell as="th">{t('amacoins.category')}</Table.Cell>
                    <Table.Cell as="th">{t('amacoins.amount')}</Table.Cell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {amacoinsHistory.transactions.slice(0, 10).map((transaction) => (
                    <Table.Row key={transaction.id}>
                      <Table.Cell>{formatDate(transaction.created_at)}</Table.Cell>
                      <Table.Cell>{transaction.description}</Table.Cell>
                      <Table.Cell>
                        <Badge
                          variant={
                            transaction.type === 'visit'
                              ? 'info'
                              : transaction.type === 'quiz'
                              ? 'success'
                              : transaction.type === 'reward'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {t(`amacoins.types.${transaction.type}`)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className={transaction.amount > 0 ? 'text-success' : 'text-danger'}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} {t('common.amacoins')}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <EmptyState
                icon="credit-card"
                title={t('amacoins.noTransactions')}
                description={t('amacoins.noTransactionsDescription')}
                compact
              />
            )}
            
            {amacoinsHistory?.transactions?.length > 10 && (
              <div className="d-flex justify-content-center mt-4">
                <Button variant="outline">
                  {t('amacoins.viewAll')}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserAmaCoins;