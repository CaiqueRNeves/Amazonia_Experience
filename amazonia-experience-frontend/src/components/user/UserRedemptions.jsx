import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getRedemptionHistory } from '../../redux/slices/rewardsSlice';
import {
  Card,
  Button,
  Table,
  Badge,
  Pagination,
  EmptyState,
  Loader,
  Image
} from '../ui';
import { formatDate, formatCurrency } from '../../utils/formatters';

const UserRedemptions = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { redemptionHistory, isLoading, error } = useSelector((state) => state.rewards);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    dispatch(getRedemptionHistory({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading && !redemptionHistory.redemptions?.length) {
    return <Loader />;
  }

  if (error) {
    return (
      <Card className="error-card">
        <h3>{t('common.error')}</h3>
        <p>{error}</p>
        <Button onClick={() => dispatch(getRedemptionHistory({ page: currentPage, limit: pageSize }))}>
          {t('common.tryAgain')}
        </Button>
      </Card>
    );
  }

  if (!redemptionHistory.redemptions?.length) {
    return (
      <EmptyState
        icon="gift"
        title={t('redemptions.noRedemptions')}
        description={t('redemptions.noRedemptionsDescription')}
        action={
          <Link to="/rewards">
            <Button variant="primary">{t('redemptions.browseRewards')}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="user-redemptions">
      <Card>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>{t('redemptions.title')}</h2>
          <Badge variant="success">
            {t('redemptions.total', { count: redemptionHistory.total || redemptionHistory.redemptions.length })}
          </Badge>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Cell as="th">{t('redemptions.date')}</Table.Cell>
              <Table.Cell as="th">{t('redemptions.reward')}</Table.Cell>
              <Table.Cell as="th">{t('redemptions.type')}</Table.Cell>
              <Table.Cell as="th">{t('redemptions.status')}</Table.Cell>
              <Table.Cell as="th">{t('redemptions.amacoins')}</Table.Cell>
              <Table.Cell as="th">{t('common.actions')}</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {redemptionHistory.redemptions.map((redemption) => (
              <Table.Row key={redemption.id}>
                <Table.Cell>{formatDate(redemption.redeemed_at)}</Table.Cell>
                <Table.Cell className="d-flex align-items-center">
                  {redemption.reward_image_url && (
                    <Image
                      src={redemption.reward_image_url}
                      alt={redemption.reward_name}
                      width={40}
                      height={40}
                      className="me-2 rounded"
                    />
                  )}
                  <span>{redemption.reward_name}</span>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant={
                    redemption.reward_type === 'physical_product' 
                      ? 'info' 
                      : redemption.reward_type === 'digital_service' 
                        ? 'primary' 
                        : 'secondary'
                  }>
                    {t(`rewards.types.${redemption.reward_type}`)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    variant={
                      redemption.status === 'completed'
                        ? 'success'
                        : redemption.status === 'pending'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {t(`redemptions.status.${redemption.status}`)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant="primary">
                    {redemption.amacoins_spent} {t('common.amacoins')}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/rewards/${redemption.reward_id}`}>
                    <Button size="sm" variant="outline">
                      {t('common.view')}
                    </Button>
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {redemptionHistory.totalPages > 1 && (
          <div className="pagination-container mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={redemptionHistory.totalPages}
              onPageChange={handlePageChange}
              siblingCount={1}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserRedemptions;