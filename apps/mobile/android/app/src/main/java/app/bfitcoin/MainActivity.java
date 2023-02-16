package app.bfitcoin;

import android.os.Bundle;
import android.view.View;
import com.zoontek.rnbootsplash.RNBootSplash;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Fitlink";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // https://github.com/software-mansion/react-native-screens#android
    super.onCreate(null);

    View decorView = getWindow().getDecorView();
    decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE
      | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);

    RNBootSplash.init(R.drawable.bootsplash, MainActivity.this);

  }
}
