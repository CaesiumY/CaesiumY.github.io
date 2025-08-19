---
title: '[백준10867][C] 중복 빼고 정렬하기 1'
description: 'N개의 정수가 주어진다. 이때, N개의 정수를 오름차순으로 정렬하는 프로그램을 작성하시오. 같은 정수는 한 번만 출력한다.'
pubDate: '2020-09-04'
category: algorithm
draft: false
heroImage: './boostcourse_review.png'
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
#include <stdlib.h>

void init_array(int* arr, int arr_size);
void print_array(int* arr, int arr_size);
void deduplicate_array(int* arr, int *arr_size);
int is_include(int *arr, int arr_size, int value);
void sort(int* arr, int arr_size);

int main(void){
    int arr_size;
    scanf("%d", &arr_size); // 배열 크기를 묻는다

    int arr[arr_size];
    init_array(arr, arr_size); // 배열 초기화

    deduplicate_array(arr, &arr_size); // 배열 중복 제거

    sort(arr, arr_size); // 배열 정렬
    print_array(arr, arr_size); // 배열 출력
}

void init_array(int* arr, int arr_size) {
    for(int i = 0; i < arr_size; i++) {
        scanf("%d", &arr[i]);
    }
}

void print_array(int* arr, int arr_size){
    for(int i = 0; i < arr_size; i++)
		printf("%d ", arr[i]);
	printf("\n");

}

void deduplicate_array(int* arr, int *arr_size){
    int* temp = malloc(sizeof(int) * *arr_size);
    int count = 0;

    for(int i = 0; i < *arr_size; i++) {
        if(is_include(temp, count, arr[i]) == 0) {
            temp[count++] = arr[i];
        } // 만약 temp가 arr의 값을 가지고 있지 않다면 추가
    }

    for(int j = 0; j < count; j++) {
        arr[j] = temp[j];
    } // arr에 temp 값을 복사

    *arr_size = count; // 배열 뒷부분은 버리기 위해

    free(temp);
}

int is_include(int *arr, int arr_size, int value) { // 배열이 값을 포함하고 있는지 확인

    for(int i = 0; i < arr_size; i++) {
        if(arr[i] == value) {
            return 1;
        }
    }

    return 0;
}

void sort(int* arr, int arr_size){	// 버블 소트 + 중단점
    int temp;
    int count = 0; // 중단점 플래그
    for(int i = 0; i < arr_size; i++) {
        count = 0;
        for(int j = 0; j < arr_size - 1; j++) {
            if(*(arr + j) > *(arr + j + 1)){
                temp = *(arr + j);
                *(arr + j) = *(arr + j + 1);
                *(arr + j + 1) = temp;
                count++;
            }
        }
     if(count == 0) break;
    }
}
```

## 설명

상당히 정석적인 방법으로 접근하였다.
순서는 배열의 1. 중복을 제거한 뒤 2. 정렬하기 로 선택했다.
중복을 제거하여 최대한 정렬할 배열의 크기를 줄여 시간을 줄이기 위해서이다.

중복 제거의 방법 또한 정석으로, 심플하다.
배열을 돌면서 아이템을 추가하고, `is_include(...)` 함수로 이미 넣었는지 확인하여 추가를 결정한다.

정렬하기는 내가 좋아하는 버블 정렬을 사용하였다.~~구현이 쉬워서~~
시간이 조금 걸리지만, 조금이라도 줄여보고자 중단점`(count 변수)`을 구현했다.

사실 `C`언어를 사용해서 그렇지, `js`나 `python`이었으면 `Set`로 만들고 `sort()` 함수만 호출하면... 최소 한 줄에 끝날 일이다.

또한 이러한 방법 말고도, 해시 테이블을 만드는 방법도 있는데, 그건 2편에서 찾아뵙고자 한다.
