import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getVisitHistory } from '../../redux/slices/userSlice';
import {
  Card,
  Button,
  Table,
  Badge,
  Pagination,
  EmptyState,
  Loader
} from '../ui';
import { formatDate } from '../../utils/formatters';

const UserVisits = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { visits, isLoading, error } = useSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    dispatch(getVisitHistory({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading && !visits.data?.length) {
    return <Loader />;
  }

  if (error) {
    return (
      <Card className="error-card">
        <h3>{t('common.error')}</h3>
        <p>{error}</p>
        <Button onClick={() => dispatch(getVisitHistory({ page: currentPage, limit: pageSize }))}>
          {t('common.tryAgain')}
        </Button>
      </Card>
    );
  }

  if (!visits.data?.length) {
    return (
      <EmptyState
        icon="map-pin"
        title={t('visits.noVisits')}
        description={t('visits.noVisitsDescription')}
        action={
          <Link to="/places">
            <Button variant="primary">{t('visits.exploreNow')}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="user-visits">
      <Card>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>{t('visits.title')}</h2>
          <Badge variant="success">{t('visits.total', { count: visits.total || visits.data.length })}</Badge>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Cell as="th">{t('visits.date')}</Table.Cell>
              <Table.Cell as="th">{t('visits.location')}</Table.Cell>
              <Table.Cell as="th">{t('visits.type')}</Table.Cell>
              <Table.Cell as="th">{t('visits.status')}</Table.Cell>
              <Table.Cell as="th">{t('visits.amacoins')}</Table.Cell>
              <Table.Cell as="th">{t('common.actions')}</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {visits.data.map((visit) => (
              <Table.Row key={visit.id}>
                <Table.Cell>{formatDate(visit.visited_at)}</Table.Cell>
                <Table.Cell>
                  {visit.place_name || visit.event_name || t('visits.unknownLocation')}
                </Table.Cell>
                <Table.Cell>
                  <Badge variant={visit.place_id ? 'info' : 'primary'}>
                    {visit.place_id ? t('visits.place') : t('visits.event')}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    variant={
                      visit.status === 'verified'
                        ? 'success'
                        : visit.status === 'pending'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {t(`visits.status.${visit.status}`)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant="primary">
                    {visit.amacoins_earned} {t('common.amacoins')}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {visit.place_id ? (
                    <Link to={`/places/${visit.place_id}`}>
                      <Button size="sm" variant="outline">
                        {t('common.view')}
                      </Button>
                    </Link>
                  ) : visit.event_id ? (
                    <Link to={`/events/${visit.event_id}`}>
                      <Button size="sm" variant="outline">
                        {t('common.view')}
                      </Button>
                    </Link>
                  ) : null}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {visits.totalPages > 1 && (
          <div className="pagination-container mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={visits.totalPages}
              onPageChange={handlePageChange}
              siblingCount={1}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserVisits;