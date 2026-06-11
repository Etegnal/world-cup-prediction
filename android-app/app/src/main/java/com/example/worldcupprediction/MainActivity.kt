package com.example.worldcupprediction

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebSettings
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.example.worldcupprediction.theme.WorldCupPredictionTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            var webViewRef by remember { mutableStateOf<WebView?>(null) }
            
            BackHandler(enabled = true) {
                if (webViewRef?.canGoBack() == true) {
                    webViewRef?.goBack()
                } else {
                    finish()
                }
            }

            WorldCupPredictionTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AndroidView(
                        modifier = Modifier
                            .fillMaxSize()
                            .safeDrawingPadding(),
                        factory = { context ->
                            WebView(context).apply {
                                settings.javaScriptEnabled = true
                                settings.domStorageEnabled = true
                                settings.useWideViewPort = true
                                settings.loadWithOverviewMode = true
                                settings.cacheMode = WebSettings.LOAD_DEFAULT
                                webViewClient = object : WebViewClient() {
                                    override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                                        if (url != null) {
                                            view?.loadUrl(url)
                                        }
                                        return true
                                    }
                                }
                                loadUrl("https://etegnal.github.io/world-cup-prediction/")
                                webViewRef = this
                            }
                        }
                    )
                }
            }
        }
    }
}
