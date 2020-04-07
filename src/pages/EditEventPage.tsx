import React from 'react';
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeArea } from 'react-native-safe-area-context';
import moment from 'moment';

import { TRedux } from '@reducers';
import { TEvent, TPoint } from '@backend/kappa';
import { theme } from '@constants';
import {
  Block,
  Text,
  Header,
  EndCapButton,
  RadioList,
  FormattedInput,
  Switch,
  ListButton,
  SlideModal,
  FadeModal,
  TextButton
} from '@components';
import { HeaderHeight } from '@services/utils';
import { extractPoints } from '@services/kappaService';

const { width, height } = Dimensions.get('screen');

const EditEventPage: React.FC<{
  initialEvent: TEvent;
  onPressBack(): void;
  onPressSave(event: Partial<TEvent>, points: Array<Partial<TPoint>>): void;
}> = ({ initialEvent, onPressBack, onPressSave }) => {
  const insets = useSafeArea();

  const [choosingType, setChoosingType] = React.useState<boolean>(false);
  const [type, setType] = React.useState<string>(initialEvent ? initialEvent.event_type : '');

  const [showErrors, setShowErrors] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>(initialEvent ? initialEvent.title : '');
  const [description, setDescription] = React.useState<string>(initialEvent ? initialEvent.description : '');
  const [pickerMode, setPickerMode] = React.useState<'date' | 'time'>(null);
  const [startDate, setStartDate] = React.useState(
    initialEvent ? moment(initialEvent.start) : moment(new Date()).startOf('hour')
  );
  const [duration, setDuration] = React.useState<string>(initialEvent ? initialEvent.duration.toString() : '');
  const [location, setLocation] = React.useState<string>(initialEvent ? initialEvent.location : '');
  const [mandatory, setMandatory] = React.useState<boolean>(initialEvent ? initialEvent.mandatory === 1 : false);
  const [excusable, setExcusable] = React.useState<boolean>(initialEvent ? initialEvent.excusable === 1 : true);
  const [profPoints, setProfPoints] = React.useState<string>(
    initialEvent ? extractPoints(initialEvent.points, 'PROF') : ''
  );
  const [philPoints, setPhilPoints] = React.useState<string>(
    initialEvent ? extractPoints(initialEvent.points, 'PHIL') : ''
  );
  const [broPoints, setBroPoints] = React.useState<string>(
    initialEvent ? extractPoints(initialEvent.points, 'BRO') : ''
  );
  const [rushPoints, setRushPoints] = React.useState<string>(
    initialEvent ? extractPoints(initialEvent.points, 'RUSH') : ''
  );
  const [anyPoints, setAnyPoints] = React.useState<string>(
    initialEvent ? extractPoints(initialEvent.points, 'ANY') : ''
  );

  const timezone = React.useMemo(() => {
    const date = new Date().toString();

    return date.substring(date.indexOf('(') + 1, date.lastIndexOf(')'));
  }, []);

  const onPressSaveButton = React.useCallback(() => {
    const event: Partial<TEvent> = {
      event_type: type,
      mandatory: mandatory ? 1 : 0,
      excusable: excusable ? 1 : 0,
      title,
      description,
      start: startDate.toDate().toString(),
      duration: parseInt(duration || '0'),
      location,

      id: initialEvent ? initialEvent.id : '',
      creator: initialEvent ? initialEvent.creator : '',
      event_code: initialEvent ? initialEvent.event_code : ''
    };

    if (event.title === '' || event.duration === 0) {
      setShowErrors(true);
      Alert.alert('One or more fields is invalid');
      return;
    }

    const points: Array<Partial<TPoint>> = [
      {
        category: 'PROF',
        count: parseInt(profPoints || '0')
      },
      {
        category: 'PHIL',
        count: parseInt(philPoints || '0')
      },
      {
        category: 'BRO',
        count: parseInt(broPoints || '0')
      },
      {
        category: 'RUSH',
        count: parseInt(rushPoints || '0')
      },
      {
        category: 'ANY',
        count: parseInt(anyPoints || '0')
      }
    ];

    onPressSave(event, points);
  }, [
    title,
    description,
    startDate,
    duration,
    location,
    mandatory,
    excusable,
    profPoints,
    philPoints,
    broPoints,
    rushPoints,
    anyPoints
  ]);

  const onPressBackButton = React.useCallback(() => {
    if (choosingType) {
      setChoosingType(false);
    } else {
      onPressBack();
    }
  }, [choosingType]);

  const onPressStartDate = () => {
    setPickerMode('date');
  };

  const onPressStartTime = () => {
    setPickerMode('time');
  };

  const onPressClosePicker = () => {
    setPickerMode(null);
  };

  const numberFormatter = (text: string) => {
    return text !== undefined ? text.replace(/\D/g, '') : '';
  };

  const onChangeDate = React.useCallback(
    (e, selectedDate) => {
      if (Platform.OS === 'android') {
        setPickerMode(null);
      }

      setStartDate(moment(selectedDate || startDate));
    },
    [startDate]
  );

  const renderChoosingType = () => {
    return (
      <Block flex>
        <Header title="Event Type" showBackButton={true} onPressBackButton={onPressBackButton} />

        <Block
          style={[
            styles.wrapper,
            {
              top: insets.top + HeaderHeight
            }
          ]}
        >
          <Block style={styles.content}>
            <Block style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Event Type</Text>
            </Block>

            <RadioList
              options={['GM', 'Philanthropy', 'Professional', 'Rush', 'Social', 'Misc']}
              selected={type}
              onChange={chosen => {
                setType(chosen);
                setChoosingType(false);
              }}
            />

            <Text style={styles.description}>
              The type of event affects GM counts. If an event is not marked as a GM, it will not count towards the GM
              attendance rate. These categories do not determine points, points are chosen separately per-event.
            </Text>
          </Block>
        </Block>
      </Block>
    );
  };

  const renderDatePicker = () => {
    return <DateTimePicker value={startDate.toDate()} mode={pickerMode} is24Hour={false} onChange={onChangeDate} />;
  };

  const renderDatePickerModal = () => {
    return (
      <Block style={styles.pickerModalContainer}>
        <Block style={styles.pickerModalBackground}>
          <TouchableWithoutFeedback onPress={onPressClosePicker}>
            <Block style={styles.backgroundButton} />
          </TouchableWithoutFeedback>
          <Block
            style={[
              styles.pickerModalContent,
              {
                paddingBottom: insets.bottom
              }
            ]}
          >
            <Block style={styles.pickerBar}>
              <TextButton label="Done" textStyle={styles.pickerDoneButton} onPress={onPressClosePicker} />
            </Block>
            {renderDatePicker()}
          </Block>
        </Block>
      </Block>
    );
  };

  return (
    <Block flex>
      <Header
        title={initialEvent ? 'Editing Event' : 'New Event'}
        subtitle={initialEvent ? initialEvent.title : ''}
        showBackButton={true}
        onPressBackButton={onPressBackButton}
        rightButton={type !== '' && <EndCapButton label="Save" onPress={onPressSaveButton} disabled={false} />}
      />

      <Block
        style={[
          styles.wrapper,
          {
            top: insets.top + HeaderHeight
          }
        ]}
      >
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={insets.top + HeaderHeight} enabled>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableWithoutFeedback>
              <Block
                style={[
                  styles.content,
                  {
                    paddingBottom: insets.bottom
                  }
                ]}
              >
                <Block style={styles.eventTypeContainer}>
                  <ListButton
                    keyText="Event Type"
                    valueText={type === '' ? 'choose one' : type}
                    onPress={() => setChoosingType(true)}
                  />
                </Block>

                {type !== '' && (
                  <React.Fragment>
                    <Block style={styles.propertyHeaderContainer}>
                      <Text style={styles.propertyHeader}>Title</Text>
                      <Text style={styles.propertyHeaderRequired}>*</Text>
                    </Block>
                    <FormattedInput
                      style={styles.input}
                      placeholderText="ex: General Meeting"
                      maxLength={32}
                      error={showErrors && title.trim() === ''}
                      defaultValue={title}
                      onChangeText={(text: string) => setTitle(text)}
                    />

                    <Block style={styles.propertyHeaderContainer}>
                      <Text style={styles.propertyHeader}>Short Description</Text>
                    </Block>
                    <FormattedInput
                      style={styles.multiInput}
                      placeholderText="short description"
                      multiline={true}
                      numberOfLines={6}
                      maxLength={256}
                      defaultValue={description}
                      onChangeText={(text: string) => setDescription(text)}
                    />

                    <Block style={styles.propertyHeaderContainer}>
                      <Text style={styles.propertyHeader}>Start (Time Zone: {timezone})</Text>
                      <Text style={styles.propertyHeaderRequired}>*</Text>
                    </Block>

                    <Block style={styles.doubleColumn}>
                      <Block style={styles.column}>
                        <TouchableOpacity onPress={onPressStartDate}>
                          <Block style={styles.fakeInput}>
                            <Text style={styles.fakeInputTextHeading}>Date</Text>
                            <Text style={styles.fakeInputText}>{startDate.format('ddd LL')}</Text>
                          </Block>
                        </TouchableOpacity>
                      </Block>

                      <Block style={styles.separator} />

                      <Block style={styles.column}>
                        <TouchableOpacity onPress={onPressStartTime}>
                          <Block style={styles.fakeInput}>
                            <Text style={styles.fakeInputTextHeading}>Time</Text>
                            <Text style={styles.fakeInputText}>{startDate.format('hh:mm A')}</Text>
                          </Block>
                        </TouchableOpacity>
                      </Block>
                    </Block>

                    <Block style={styles.doubleColumn}>
                      <Block style={styles.column}>
                        <Block style={styles.propertyHeaderContainer}>
                          <Text style={styles.propertyHeader}>Duration (minutes)</Text>
                          <Text style={styles.propertyHeaderRequired}>*</Text>
                        </Block>

                        <FormattedInput
                          style={styles.input}
                          placeholderText="ex: 60"
                          maxLength={4}
                          keyboardType="number-pad"
                          error={showErrors && (duration === '' || duration === '0')}
                          defaultValue={duration}
                          formatter={numberFormatter}
                          onChangeText={(text: string) => setDuration(text)}
                        />
                      </Block>

                      <Block style={styles.separator} />

                      <Block style={styles.column}></Block>
                    </Block>

                    <Block style={styles.propertyHeaderContainer}>
                      <Text style={styles.propertyHeader}>Location</Text>
                    </Block>
                    <FormattedInput
                      style={styles.input}
                      placeholderText="ex: EHall 106b1"
                      maxLength={64}
                      defaultValue={location}
                      onChangeText={(text: string) => setLocation(text)}
                    />

                    <Block style={styles.doubleColumn}>
                      <Block style={styles.column}>
                        <Block style={styles.propertyHeaderContainer}>
                          <Text style={styles.propertyHeader}>Mandatory</Text>
                        </Block>

                        <Block style={styles.switchContainer}>
                          <Switch value={mandatory} onValueChange={(newValue: boolean) => setMandatory(newValue)} />
                          <Text style={styles.description}>
                            Choose if unexcused absence results in security deposit loss (ex: voting)
                          </Text>
                        </Block>
                      </Block>

                      <Block style={styles.separator} />

                      <Block style={styles.column}>
                        <Block style={styles.propertyHeaderContainer}>
                          <Text style={styles.propertyHeader}>Excusable</Text>
                        </Block>

                        <Block style={styles.switchContainer}>
                          <Switch value={excusable} onValueChange={(newValue: boolean) => setExcusable(newValue)} />
                          <Text style={styles.description}>
                            Allow a valid excuse to count as attending (for instance GM). Do not choose this if there
                            are points
                          </Text>
                        </Block>
                      </Block>
                    </Block>

                    <Block style={styles.doubleColumn}>
                      <Block style={styles.column}>
                        <Block style={styles.propertyHeaderContainer}>
                          <Text style={styles.propertyHeader}>Professional</Text>
                        </Block>

                        <FormattedInput
                          style={styles.input}
                          placeholderText="points"
                          maxLength={1}
                          keyboardType="number-pad"
                          defaultValue={profPoints}
                          formatter={numberFormatter}
                          onChangeText={(text: string) => setProfPoints(text)}
                        />
                      </Block>

                      <Block style={styles.separator} />

                      <Block style={styles.column}>
                        <Block style={styles.propertyHeaderContainer}>
                          <Text style={styles.propertyHeader}>Philanthropy</Text>
                        </Block>

                        <FormattedInput
                          style={styles.input}
                          placeholderText="points"
                          maxLength={1}
                          keyboardType="number-pad"
                          defaultValue={philPoints}
                          formatter={numberFormatter}
                          onChangeText={(text: string) => setPhilPoints(text)}
                        />
                      </Block>
                    </Block>
                    <Block style={styles.doubleColumn}>
                      <Block style={styles.column}>
                        <Block style={styles.propertyHeaderContainer}>
                          <Text style={styles.propertyHeader}>Brother</Text>
                        </Block>

                        <FormattedInput
                          style={styles.input}
                          placeholderText="points"
                          maxLength={1}
                          keyboardType="number-pad"
                          defaultValue={broPoints}
                          formatter={numberFormatter}
                          onChangeText={(text: string) => setBroPoints(text)}
                        />
                      </Block>

                      <Block style={styles.separator} />

                      <Block style={styles.column}>
                        <Block style={styles.propertyHeaderContainer}>
                          <Text style={styles.propertyHeader}>Rush</Text>
                        </Block>

                        <FormattedInput
                          style={styles.input}
                          placeholderText="points"
                          maxLength={1}
                          keyboardType="number-pad"
                          defaultValue={rushPoints}
                          formatter={numberFormatter}
                          onChangeText={(text: string) => setRushPoints(text)}
                        />
                      </Block>
                    </Block>
                    <Block style={styles.doubleColumn}>
                      <Block style={styles.column}>
                        <Block style={styles.propertyHeaderContainer}>
                          <Text style={styles.propertyHeader}>Any</Text>
                        </Block>

                        <FormattedInput
                          style={styles.input}
                          placeholderText="points"
                          maxLength={1}
                          keyboardType="number-pad"
                          defaultValue={anyPoints}
                          formatter={numberFormatter}
                          onChangeText={(text: string) => setAnyPoints(text)}
                        />
                      </Block>

                      <Block style={styles.separator} />

                      <Block style={styles.column}>
                        <Block style={styles.propertyHeaderContainer}>
                          <Text style={styles.propertyHeader}></Text>
                        </Block>
                        <Text style={styles.description}>
                          Points in "Any" count for whatever category the brother is missing
                        </Text>
                      </Block>
                    </Block>
                  </React.Fragment>
                )}
              </Block>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </Block>

      <SlideModal visible={choosingType}>{renderChoosingType()}</SlideModal>

      {Platform.OS === 'android' && pickerMode !== null && renderDatePicker()}
      <FadeModal visible={Platform.OS === 'ios' && pickerMode !== null} transparent={true}>
        {renderDatePickerModal()}
      </FadeModal>
    </Block>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24
  },
  scrollContent: {
    flexGrow: 1
  },
  eventTypeContainer: {
    marginVertical: 16
  },
  propertyHeaderContainer: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row'
  },
  propertyHeader: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  propertyHeaderRequired: {
    marginLeft: 2,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.PRIMARY
  },
  input: {
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY
  },
  multiInput: {
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY,
    height: 128
  },
  doubleColumn: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  column: {
    flex: 1
  },
  separator: {
    width: 16
  },
  switchContainer: {
    marginTop: 8
  },
  description: {
    marginTop: 12,
    fontFamily: 'OpenSans',
    fontSize: 12
  },
  fakeInput: {
    paddingVertical: 4,
    display: 'flex',
    justifyContent: 'center'
  },
  fakeInputTextHeading: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.PRIMARY
  },
  fakeInputText: {
    fontFamily: 'OpenSans',
    fontSize: 15,
    color: theme.COLORS.PRIMARY
  },
  pickerModalContainer: {
    flex: 1
  },
  pickerModalBackground: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  backgroundButton: {
    flex: 1
  },
  pickerModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: theme.COLORS.WHITE
  },
  pickerBar: {
    height: 48,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  pickerDoneButton: {
    paddingHorizontal: 20,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 16,
    color: theme.COLORS.PRIMARY
  }
});

export default EditEventPage;