import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeArea } from 'react-native-safe-area-context';
import { ProgressCircle } from 'react-native-svg-charts';
import moment from 'moment';
import Constants from 'expo-constants';

import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import { theme } from '@constants';
import { Block, Text, Icon, GeneralMeetingChart } from '@components';
import { NavigationTypes } from '@types';
import {
  getAttendedEvents,
  getExcusedEvents,
  getTypeCounts,
  prettyPhone,
  sortEventByDate,
  shouldLoad
} from '@services/kappaService';
import { isEmpty } from '@services/utils';
import { log } from '@services/logService';
import { TEvent } from '@backend/kappa';

const ProfileContent: React.FC<{
  navigation: NavigationTypes.ParamType;
}> = ({ navigation }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const events = useSelector((state: TRedux) => state.kappa.events);
  const gmCount = useSelector((state: TRedux) => state.kappa.gmCount);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const missedMandatory = useSelector((state: TRedux) => state.kappa.missedMandatory);
  const points = useSelector((state: TRedux) => state.kappa.points);

  const [refreshing, setRefreshing] = React.useState<boolean>(false);

  const dispatch = useDispatch();
  const dispatchEdit = React.useCallback(() => dispatch(_auth.showOnboarding(true)), [dispatch]);
  const dispatchSignOut = React.useCallback(() => dispatch(_auth.signOut()), [dispatch]);
  const dispatchGetEvents = React.useCallback(() => dispatch(_kappa.getEvents(user)), [dispatch, user]);
  const dispatchGetMyAttendance = React.useCallback(() => dispatch(_kappa.getMyAttendance(user)), [dispatch, user]);
  const dispatchGetPoints = React.useCallback(() => dispatch(_kappa.getPointsByUser(user, user.email)), [
    dispatch,
    user
  ]);

  const insets = useSafeArea();

  const loadData = React.useCallback(
    (force: boolean) => {
      if (force || shouldLoad(loadHistory, 'events')) dispatchGetEvents();
      if (force || shouldLoad(loadHistory, user.email)) dispatchGetMyAttendance();
      if (force || shouldLoad(loadHistory, `points-${user.email}`)) dispatchGetPoints();
    },
    [user, loadHistory]
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    setTimeout(() => loadData(true), 500);
  }, [user, refreshing]);

  const mandatory = React.useMemo(() => {
    if (!user.privileged) return [];

    if (isEmpty(missedMandatory[user.email])) return [];

    return Object.values(missedMandatory[user.email]).sort(sortEventByDate);
  }, [user, missedMandatory]);

  React.useEffect(() => {
    if (user?.sessionToken) {
      loadData(false);
    }
  }, [user]);

  const renderEvent = (event: TEvent) => {
    return (
      <Block key={event.id} style={styles.eventContainer}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDate}>{moment(event.start).format('M/D/Y')}</Text>
      </Block>
    );
  };

  const renderAdmin = () => {
    return (
      <Block style={styles.adminContainer}>
        <GeneralMeetingChart user={user} records={records} events={events} gmCount={gmCount} />

        <Block style={styles.eventList}>
          {mandatory.length > 0 && (
            <React.Fragment>
              <Text style={styles.mandatoryLabel}>Missed Mandatory</Text>
              {mandatory.map((event: TEvent) => renderEvent(event))}
            </React.Fragment>
          )}
        </Block>
      </Block>
    );
  };

  return (
    <Block flex>
      <ScrollView>
        <Block
          style={[
            styles.content,
            {
              paddingTop: insets.top + 20
            }
          ]}
        >
          <Block style={styles.header}>
            <Block style={styles.headerTextWrapper}>
              <Text style={styles.title}>Hi {user.givenName}</Text>
              <Text style={styles.subtitle}>{user.role}</Text>
            </Block>

            <TouchableOpacity onPress={dispatchEdit}>
              <Icon style={styles.editButton} family="MaterialIcons" name="edit" size={24} />
            </TouchableOpacity>
          </Block>

          <Block>
            <Block style={styles.splitPropertyRow}>
              <Block style={styles.splitProperty}>
                <Text style={styles.propertyHeader}>Grad Year</Text>
                <Text style={styles.propertyValue}>{user.gradYear}</Text>
              </Block>
              <Block style={styles.splitProperty}>
                <Text style={styles.propertyHeader}>Pledge Class</Text>
                <Text style={styles.propertyValue}>{user.semester}</Text>
              </Block>
            </Block>
            <Block style={styles.splitPropertyRow}>
              <Block style={styles.splitProperty}>
                <Text style={styles.propertyHeader}>Email</Text>
                <Text style={styles.propertyValue}>{user.email}</Text>
              </Block>
              <Block style={styles.splitProperty}>
                <Text style={styles.propertyHeader}>Phone</Text>
                <Text style={styles.propertyValue}>{user.phone ? prettyPhone(user.phone) : ''}</Text>
              </Block>
            </Block>
          </Block>

          <Text style={styles.pointsText}>Points</Text>
          <Block>
            <Block style={styles.splitPropertyRow}>
              <Block style={styles.splitPropertyThirds}>
                <Text style={styles.propertyHeader}>Prof</Text>
                <Text style={styles.propertyValue}>
                  {points.hasOwnProperty(user.email) ? points[user.email].PROF : '0'}
                </Text>
              </Block>
              <Block style={styles.splitPropertyThirds}>
                <Text style={styles.propertyHeader}>Phil</Text>
                <Text style={styles.propertyValue}>
                  {points.hasOwnProperty(user.email) ? points[user.email].PHIL : '0'}
                </Text>
              </Block>
              <Block style={styles.splitPropertyThirds}>
                <Text style={styles.propertyHeader}>Bro</Text>
                <Text style={styles.propertyValue}>
                  {points.hasOwnProperty(user.email) ? points[user.email].BRO : '0'}
                </Text>
              </Block>
            </Block>
            <Block style={styles.splitPropertyRow}>
              <Block style={styles.splitPropertyThirds}>
                <Text style={styles.propertyHeader}>Rush</Text>
                <Text style={styles.propertyValue}>
                  {points.hasOwnProperty(user.email) ? points[user.email].RUSH : '0'}
                </Text>
              </Block>
              <Block style={styles.splitPropertyThirds}>
                <Text style={styles.propertyHeader}>Any</Text>
                <Text style={styles.propertyValue}>
                  {points.hasOwnProperty(user.email) ? points[user.email].ANY : '0'}
                </Text>
              </Block>
            </Block>
          </Block>

          <Block>{renderAdmin()}</Block>

          <Text style={styles.madeWithText}>
            {`${Constants.manifest.version} - ${Constants.manifest.revisionId} - ${Constants.manifest.sdkVersion} - ${Constants.nativeBuildVersion}\n\nWhatsoever thy hand findeth to do, do it with thy might.\nJTC - Web Chair 2019-2021`}
          </Text>
        </Block>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerTextWrapper: {},
  title: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 24
  },
  subtitle: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    color: theme.COLORS.GRAY
  },
  editButton: {
    paddingTop: 6
  },
  propertyHeader: {
    marginTop: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  propertyValue: {
    marginTop: 4,
    fontFamily: 'OpenSans',
    fontSize: 15
  },
  splitPropertyRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  splitProperty: {
    width: '50%'
  },
  splitPropertyThirds: {
    width: '33%'
  },
  pointsText: {
    marginTop: 20,
    fontFamily: 'OpenSans-Bold',
    fontSize: 24,
    marginBottom: -8
  },
  adminContainer: {},
  mandatoryLabel: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 15,
    color: theme.COLORS.PRIMARY,
    textTransform: 'uppercase'
  },
  eventList: {},
  eventContainer: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  eventTitle: {
    fontFamily: 'OpenSans',
    fontSize: 16
  },
  eventDate: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    color: theme.COLORS.GRAY,
    textTransform: 'uppercase'
  },
  madeWithText: {
    marginTop: 32,
    marginBottom: 8,
    fontFamily: 'OpenSans',
    fontSize: 12,
    color: theme.COLORS.BORDER,
    textAlign: 'center'
  }
});

export default ProfileContent;
