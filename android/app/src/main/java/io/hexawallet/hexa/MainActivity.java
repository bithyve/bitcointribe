package io.hexawallet.hexa;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import expo.modules.ReactActivityDelegateWrapper;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "HEXA";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        // return new ReactActivityDelegate(this, getMainComponentName()) {
        //     @Override
        //     protected ReactRootView createRootView() {
        //         return new RNGestureHandlerEnabledRootView(MainActivity.this);
        //         ReactRootView reactRootView = new ReactRootView(getContext());
        //         // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        //         reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
        //         return reactRootView;
        //     }
        // };
        return new ReactActivityDelegateWrapper(this, new MainActivityDelegate(this, getMainComponentName()));
    }

    public static class MainActivityDelegate extends ReactActivityDelegate {
        public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
            super(activity, mainComponentName);
        }
    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }
  }

    // prevent tapjacking
    // https://stackoverflow.com/questions/51818363/how-to-solve-tapjacking-vulnerability-in-reactnative-app
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        View v = findViewById(android.R.id.content);
        v.setFilterTouchesWhenObscured(true);
        getWindow().setNavigationBarColor(getResources().getColor(R.color.blue));
    }

    @Override
    protected void onResume() {
        super.onResume();
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }

    @Override
    protected void onPause() {
        super.onPause();
        getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE
        );
    }
}
