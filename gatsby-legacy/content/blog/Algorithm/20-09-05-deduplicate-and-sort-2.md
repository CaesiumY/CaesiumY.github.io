---
title: '[백준10867][C] 중복 빼고 정렬하기 2'
date: 2020-09-05 00:09:88
category: algorithm
thumbnail: 'images/20-09-05/boostcourse_review.png/boostcourse_review.png'
draft: false
---

# 🚄문제 링크

https://www.acmicpc.net/problem/10867

# 📖문제 내용

## 문제

N개의 정수가 주어진다. 이때, N개의 정수를 오름차순으로 정렬하는 프로그램을 작성하시오. 같은 정수는 한 번만 출력한다.

## 입력

첫째 줄에 수의 개수 N (1 ≤ N ≤ 100,000)이 주어진다. 둘째에는 숫자가 주어진다. 이 수는 절댓값이 1,000보다 작거나 같은 정수이다.

## 출력

첫째 줄에 수를 오름차순으로 정렬한 결과를 출력한다. 이때, 같은 수는 한 번만 출력한다.

## 예제

### 예제 입력

> 10
> 1 4 2 3 1 4 2 3 1 2

### 예제 출력

> 1 2 3 4

# 😎제출 코드

```c
#include <stdio.h>

int main() {

    int input_size, tmp; // 입력할 수의 길이와 임시 변수 선언
    int arr[1000] = { 0, }; // 모두 0으로 채워진 길이 1000의 배열 선언

    scanf("%d", &input_size);

	for (int i = 0; i < input_size; i++)	{
		scanf("%d", &tmp);
		arr[tmp]++; // 입력한 수의 인덱스마다 ++
	}

	for (int j = 0; j < 1000; j++)	{
		if (arr[j] != 0) // 0이 아닌 모든 인덱스를 출력
			printf("%d ", j);
	}
    printf("\n");

	return 0;
}
```

## 설명

`js`를 하다보면 `object`를 이용하여 워드 카운트 같은 알고리즘을 하나쯤은 풀어보게 된다. 비슷하게 `python`의 경우에는 `dictionary`가 되겠다.

그걸 변형하여 풀어본 것이다. 해시 알고리즘과 비슷하달까.

대신 C의 배열 인덱스에 접근해야 하므로, 단어는 세지 못하고 오직 숫자만 셀 수가 있다.

그게 어딘가. 저번 1편의 코드에 비하면 그 **길이도, 시간복잡도도 선녀이다.**

# 추가

![boostcourse_review](images/20-09-05/boostcourse_review.png/boostcourse_review.png)

나중에 올려주신 풀이를 보니, 오히려 내가 추가로 낸 2번 풀이가 문제 의도였다고 하신다...

사실 라이브 강의 때 숨겨진 정답이 있다고 하시면서 내가 풀었던 것과 흡사한 코드를 보여주셨을 때 매우 신났다. 하하하

> 다른 점이라면 배열 크기를 3000으로 잡으신 것과 변수 이름이 다르단 거??
