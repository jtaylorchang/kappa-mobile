import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Alert,
  TouchableWithoutFeedback,
  TouchableOpacity,
  KeyboardAvoidingView
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Constants from 'expo-constants';
import { useSafeArea } from 'react-native-safe-area-context';

import { TRedux } from '@reducers';
import { _auth } from '@reducers/actions';
import { HORIZONTAL_PADDING } from '@services/utils';
import { theme, Images } from '@constants';
import { Block, Text, GoogleSignInButton, FormattedInput, RoundButton } from '@components';

const numberFormatter = (text: string) => {
  return text !== undefined ? text.replace(/\D/g, '') : '';
};

const LoginPage: React.FC = () => {
  const authorized = useSelector((state: TRedux) => state.auth.authorized);
  const isAuthenticating = useSelector((state: TRedux) => state.auth.isAuthenticating);
  const isSigningInWithGoogle = useSelector((state: TRedux) => state.auth.isSigningInWithGoogle);
  const signInWithGoogleErrorMessage = useSelector((state: TRedux) => state.auth.signInWithGoogleErrorMessage);
  const signInErrorMessage = useSelector((state: TRedux) => state.auth.signInErrorMessage);

  const [signInMethod, setSignInMethod] = React.useState<'google' | 'code'>('google');
  const [secretCode, setSecretCode] = React.useState<string>('');

  const dispatch = useDispatch();
  const dispatchHideModal = React.useCallback(() => dispatch(_auth.hideModal()), [dispatch]);
  const dispatchSignInWithGoogle = React.useCallback(() => dispatch(_auth.signInWithGoogle()), [dispatch]);
  const dispatchSignInDemo = React.useCallback(() => dispatch(_auth.signInDemo()), [dispatch]);
  const dispatchSignInWithSecretCode = React.useCallback(() => dispatch(_auth.authenticateWithSecretCode(secretCode)), [
    dispatch,
    secretCode
  ]);

  const insets = useSafeArea();

  const onPressLogo = React.useCallback(() => {
    dispatchSignInDemo();
  }, [dispatchSignInDemo]);

  const onPressChooseGoogle = React.useCallback(() => setSignInMethod('google'), []);
  const onPressChooseCode = React.useCallback(() => setSignInMethod('code'), []);

  const onChangeSecretCode = React.useCallback((text: string) => setSecretCode(text), []);

  React.useEffect(() => {
    if (authorized) {
      dispatchHideModal();
    }
  }, [authorized, dispatchHideModal]);

  React.useEffect(() => {
    if (signInWithGoogleErrorMessage && signInWithGoogleErrorMessage !== 'Canceled') {
      Alert.alert('Could not sign in!', signInWithGoogleErrorMessage);
    }
  }, [signInWithGoogleErrorMessage]);

  React.useEffect(() => {
    if (signInErrorMessage) {
      Alert.alert('Could not sign in!', signInErrorMessage);
    }
  }, [signInErrorMessage]);

  const renderBackground = () => {
    return <Block style={styles.bg} />;
  };

  const renderContent = () => {
    return (
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior="position" enabled>
        <View style={[styles.scrollContent, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <Block style={styles.content}>
            <Text style={styles.title}>KAPPA</Text>

            <TouchableWithoutFeedback onPress={onPressLogo}>
              <Image style={styles.logo} source={Images.Kappa} resizeMode="contain" />
            </TouchableWithoutFeedback>

            <Text style={styles.subtitle}>THETA TAU</Text>

            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  {
                    marginRight: 10
                  },
                  signInMethod === 'google' && {
                    backgroundColor: `${theme.COLORS.PRIMARY}1A`,
                    borderColor: theme.COLORS.PRIMARY
                  }
                ]}
                activeOpacity={0.6}
                onPress={onPressChooseGoogle}
              >
                <Text style={[styles.segmentTitle, signInMethod === 'google' && { color: theme.COLORS.PRIMARY }]}>
                  Sign in with Google
                </Text>
                <Text style={styles.segmentDescription}>Sign in using your official email in our records.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segment,
                  {
                    marginLeft: 10
                  },
                  signInMethod === 'code' && {
                    backgroundColor: `${theme.COLORS.PRIMARY}1A`,
                    borderColor: theme.COLORS.PRIMARY
                  }
                ]}
                activeOpacity={0.6}
                onPress={onPressChooseCode}
              >
                <Text style={[styles.segmentTitle, signInMethod === 'code' && { color: theme.COLORS.PRIMARY }]}>
                  Sign in with Computer
                </Text>
                <Text style={styles.segmentDescription}>
                  Sign in on your computer and generate a code from your profile page.
                </Text>
              </TouchableOpacity>
            </View>
          </Block>

          <Block style={styles.bottomArea}>
            {signInMethod === 'google' && (
              <GoogleSignInButton
                loading={isSigningInWithGoogle || isAuthenticating}
                onPress={dispatchSignInWithGoogle}
              />
            )}

            {signInMethod === 'code' && (
              <View style={styles.codeContainer}>
                <View style={styles.inputWrapper}>
                  <FormattedInput
                    style={styles.input}
                    placeholderText="sign-in code"
                    maxLength={6}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    value={secretCode}
                    onChangeText={onChangeSecretCode}
                    formatter={numberFormatter}
                  />
                </View>

                <View style={styles.submitButton}>
                  <RoundButton
                    label="Sign In"
                    disabled={secretCode.length !== 6}
                    loading={isAuthenticating}
                    onPress={dispatchSignInWithSecretCode}
                  />
                </View>
              </View>
            )}

            <Text style={styles.madeWithText}>
              {`Whatsoever thy hand findeth to do, do it with thy might.\n\n${Constants.nativeBuildVersion} - ${Constants.manifest.sdkVersion} - ${Constants.manifest.revisionId}`}
            </Text>
          </Block>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <Block flex>
      {renderBackground()}
      {renderContent()}
    </Block>
  );
};

const styles = StyleSheet.create({
  bg: {
    position: 'absolute',
    flex: 1,
    backgroundColor: theme.COLORS.WHITE
  },
  fg: {
    flex: 1
  },
  keyboardAvoidingView: {
    flex: 1
  },
  scrollContent: {
    height: '100%'
  },
  content: {
    flex: 1,
    paddingTop: 32,
    alignItems: 'center'
  },
  bottomArea: {
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 48
  },
  subtitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 32
  },
  logo: {
    flex: 1,
    maxHeight: 160,
    marginVertical: 20
  },
  segmentContainer: {
    marginTop: 40,
    marginHorizontal: HORIZONTAL_PADDING,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  segment: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY,
    borderColor: theme.COLORS.BORDER,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth * 2
  },
  segmentTitle: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 15
  },
  segmentDescription: {
    marginTop: 4,
    fontFamily: 'OpenSans',
    fontSize: 13,
    color: theme.COLORS.DARK_GRAY
  },
  madeWithText: {
    marginTop: 16,
    fontFamily: 'OpenSans',
    fontSize: 12,
    color: theme.COLORS.BORDER,
    textAlign: 'center'
  },
  codeContainer: {
    marginTop: 40,
    marginHorizontal: HORIZONTAL_PADDING,
    backgroundColor: theme.COLORS.WHITE,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputWrapper: {
    flex: 1
  },
  input: {
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY
  },
  submitButton: {
    marginLeft: HORIZONTAL_PADDING,
    width: 128
  }
});

export default LoginPage;
