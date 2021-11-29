#include <bits/stdc++.h>
using namespace std;
#define int long long
#define endl '\n'
#define pb push_back
#define mp make_pair
#define F first
#define S second
#define T third
typedef vector<int> vi;
typedef vector<bool> vb;
typedef vector<char> vc;
typedef vector<pair<int, int>> vp;
typedef vector<vector<int>> vvi;
typedef vector<vector<char>> vvc;
const int C1 = 1e9 + 7;
const int C2 = 998244353;
//const int inf=1e18;
void yes()
{
    cout << "YES\n";
}
void no()
{
    cout << "NO\n";
}
int binpow(int a, int b, int m = C1)
{
    a %= m;
    int res = 1;
    while (b > 0)
    {
        if (b & 1)
            res = res * a % m;
        a = a * a % m;
        b >>= 1;
    }
    return res;
}

//Variables*******************************************
vi a;
int f(int i){
    return a[i];
}
int n;
int duplicate(){
    int p=0;
    for(int i=1;i<n;i++){
        p=f(p);
        //cout<<p<<endl;
    }
    //cout<<p<<endl;
    int q=f(p),l=1;
    while(p!=q){
        q=f(q);
        l=l+1;
    }
   // cout<<l<<endl;
    p=q=0;
    for(int i=0;i<l;i++){
        //cout<<q<<" ";
        q=f(q);
        //cout<<q<<endl;
    }
    //cout<<q<<endl;
    while(p!=q){
        p=f(p);
        q=f(q);
        cout<<p<<" "<<q<<endl;
    }
    return p;
}

void solve()
{
    cin>>n;
    a.resize(n);
    for(int i=0;i<n;i++){
        cin>>a[i];
    }
    cout<<duplicate()<<endl;
}
//*****************************************************

signed main()
{
    ios_base::sync_with_stdio(0);
    cin.tie(0);
    cout.tie(0);
    int t = 1;
  //  cin >> t;
    while (t--)
    {
        solve();
    }
}